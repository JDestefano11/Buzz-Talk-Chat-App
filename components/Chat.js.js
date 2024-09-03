import React, { useState, useEffect } from "react";
import { StyleSheet, View, Platform, SafeAreaView, Image, Dimensions, Text, Alert, TouchableOpacity } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Day, Send } from "react-native-gifted-chat";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from "./CustomActions";
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

const Chat = ({ route, navigation, db, storage, isConnected }) => {
    const { name, userID } = route.params;
    const bgColor = route.params.bgColor;
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const cacheMessages = async (messagesToCache) => {
        try {
            await AsyncStorage.setItem("messages", JSON.stringify(messagesToCache));
        } catch (error) {
            console.log(error);
        }
    };

    const loadCachedMessages = async () => {
        try {
            const cachedMessages = await AsyncStorage.getItem("messages");
            if (cachedMessages !== null) {
                setMessages(JSON.parse(cachedMessages));
            }
        } catch (error) {
            console.log('Error loading cached messages', error.message);
        }
    };

    const onSend = (newMessages) => {
        if (isConnected) {
            addDoc(collection(db, "messages"), newMessages[0]);
        } else {
            setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
            cacheMessages([...messages, ...newMessages]);
        }
    };

    const deleteMessage = async (messageId) => {
        if (isConnected) {
            try {
                await deleteDoc(doc(db, "messages", messageId));
            } catch (error) {
                console.error("Error deleting message: ", error);
            }
        } else {
            setMessages(prevMessages => prevMessages.filter(message => message._id !== messageId));
            cacheMessages(messages.filter(message => message._id !== messageId));
        }
        setSelectedMessage(null);
    };

    const renderInputToolbar = (props) => {
        if (isConnected) {
            return (
                <InputToolbar
                    {...props}
                    containerStyle={styles.inputToolbar}
                    primaryStyle={styles.inputPrimary}
                    textInputStyle={styles.textInput}
                />
            );
        }
        return null;
    };

    const renderBubble = (props) => {
        const isSelected = selectedMessage === props.currentMessage._id;

        const handleLongPress = () => {
            setSelectedMessage(props.currentMessage._id);
            Alert.alert(
                "Delete Message",
                "Are you sure you want to delete this message?",
                [
                    { text: "Cancel", style: "cancel", onPress: () => setSelectedMessage(null) },
                    { text: "Delete", onPress: () => deleteMessage(props.currentMessage._id) }
                ]
            );
        };

        if (props.currentMessage.image) {
            return renderMessageImage(props, isSelected, handleLongPress);
        }
        if (props.currentMessage.location) {
            return renderMessageLocation(props, isSelected, handleLongPress);
        }

        return (
            <TouchableOpacity onLongPress={handleLongPress} activeOpacity={0.7}>
                <Bubble
                    {...props}
                    wrapperStyle={{
                        right: [styles.bubbleRight, isSelected && styles.selectedBubble],
                        left: [styles.bubbleLeft, isSelected && styles.selectedBubble],
                    }}
                    textStyle={{
                        right: styles.bubbleTextRight,
                        left: styles.bubbleTextLeft,
                    }}
                    timeTextStyle={{
                        right: styles.timeTextRight,
                        left: styles.timeTextLeft,
                    }}
                />
            </TouchableOpacity>
        );
    };

    const renderDay = (props) => (
        <Day
            {...props}
            textStyle={styles.dayText}
        />
    );

    const renderSend = (props) => (
        <Send {...props} containerStyle={styles.sendButtonContainer}>
            <View style={styles.sendButton}>
                <Ionicons name="send" size={24} color="#FFD700" />
            </View>
        </Send>
    );

    const renderCustomActions = (props) => {
        return <CustomActions storage={storage} userID={userID} {...props} />;
    };

    const renderMessageImage = (props, isSelected, handleLongPress) => {
        const { width } = Dimensions.get('window');
        const isCurrentUser = props.currentMessage.user._id === props.user._id;

        return (
            <TouchableOpacity onLongPress={handleLongPress} activeOpacity={0.7}>
                <View style={[
                    styles.imageContainer,
                    isCurrentUser ? styles.sentImageContainer : styles.receivedImageContainer,
                    isSelected && styles.selectedImage
                ]}>
                    <Image
                        style={styles.messageImage}
                        source={{ uri: props.currentMessage.image }}
                    />
                    <View style={[
                        styles.imageBottomRow,
                        isCurrentUser ? styles.sentTimeContainer : styles.receivedTimeContainer
                    ]}>
                        <Text style={styles.imageTime}>
                            {props.currentMessage.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderMessageLocation = (props, isSelected, handleLongPress) => {
        const { latitude, longitude } = props.currentMessage.location;
        const { width } = Dimensions.get('window');
        const isCurrentUser = props.currentMessage.user._id === props.user._id;

        return (
            <TouchableOpacity onLongPress={handleLongPress} activeOpacity={0.7}>
                <View style={[
                    styles.imageContainer,
                    isCurrentUser ? styles.sentImageContainer : styles.receivedImageContainer,
                    isSelected && styles.selectedImage
                ]}>
                    <MapView
                        style={styles.mapView}
                        initialRegion={{
                            latitude,
                            longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                    >
                        <Marker coordinate={{ latitude, longitude }} />
                    </MapView>
                    <View style={[
                        styles.imageBottomRow,
                        isCurrentUser ? styles.sentTimeContainer : styles.receivedTimeContainer
                    ]}>
                        <Text style={styles.imageTime}>
                            {props.currentMessage.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    useEffect(() => {
        navigation.setOptions({ title: name });

        let unsubscribe;
        if (isConnected === true) {
            const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
            unsubscribe = onSnapshot(q, (snapshot) => {
                const messagesFirestore = snapshot.docs.map(doc => ({
                    _id: doc.id,
                    createdAt: doc.data().createdAt.toDate(),
                    text: doc.data().text,
                    user: doc.data().user,
                    image: doc.data().image,
                    location: doc.data().location,
                }));
                cacheMessages(messagesFirestore);
                setMessages(messagesFirestore);
            });
        } else {
            loadCachedMessages();
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [isConnected]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.chatContainer}>
                <GiftedChat
                    messages={messages}
                    renderBubble={renderBubble}
                    renderInputToolbar={renderInputToolbar}
                    renderDay={renderDay}
                    renderSend={renderSend}
                    onSend={messages => onSend(messages)}
                    renderActions={renderCustomActions}
                    renderMessageImage={renderMessageImage}
                    user={{
                        _id: userID,
                        name
                    }}
                    scrollToBottom
                    alwaysShowSend
                    renderAvatar={null}
                    listViewProps={{
                        style: {
                            marginBottom: 20
                        }
                    }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    chatContainer: {
        flex: 1,
    },
    inputToolbar: {
        backgroundColor: '#1F1F1F',
        borderTopWidth: 1,
        borderTopColor: '#333333',
        padding: 8,
    },
    inputPrimary: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    textInput: {
        color: '#FFFFFF',
        backgroundColor: '#333333',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginRight: 10,
        flex: 1,
        minHeight: 40,
        height: 40,
        textAlignVertical: 'center',
    },
    bubbleRight: {
        backgroundColor: "#FFD700",
        borderRadius: 18,
        padding: 12,
        marginBottom: 8,
        marginLeft: 60,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    bubbleLeft: {
        backgroundColor: "#333333",
        borderRadius: 18,
        padding: 12,
        marginBottom: 8,
        marginRight: 60,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    bubbleTextRight: {
        color: "#000000",
        fontSize: 16,
    },
    bubbleTextLeft: {
        color: "#FFD700",
        fontSize: 16,
    },
    dayText: {
        color: '#FFD700',
        fontWeight: '600',
    },
    sendButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginRight: 10,
        marginBottom: 5,
    },
    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 26,
        width: 26,
    },
    timeTextRight: {
        color: '#333333',
        fontSize: 12,
    },
    timeTextLeft: {
        color: '#D4AF37',
        fontSize: 12,
    },
    imageContainer: {
        flexDirection: 'column',
        marginBottom: 10,
    },
    sentImageContainer: {
        alignItems: 'flex-end',
    },
    receivedImageContainer: {
        alignItems: 'flex-start',
    },
    messageImage: {
        width: Dimensions.get('window').width * 0.7,
        height: Dimensions.get('window').width * 0.7,
        borderRadius: 13,
        margin: 3,
        resizeMode: 'cover',
    },
    mapView: {
        width: Dimensions.get('window').width * 0.7,
        height: Dimensions.get('window').width * 0.5,
        borderRadius: 13,
    },
    imageBottomRow: {
        flexDirection: 'row',
        width: Dimensions.get('window').width * 0.7,
        paddingTop: 5,
    },
    sentTimeContainer: {
        justifyContent: 'flex-end',
    },
    receivedTimeContainer: {
        justifyContent: 'flex-start',
    },
    imageTime: {
        color: '#D4AF37',
        fontSize: 12,
    },
    selectedBubble: {
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
    },
    selectedImage: {
        opacity: 0.7,
    },
});

export default Chat;

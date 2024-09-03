import { useState, useEffect } from "react";
import { StyleSheet, View, Platform, SafeAreaView, Image, Dimensions, Text } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Day, Send } from "react-native-gifted-chat";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from "./CustomActions";
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps'; // Import MapView

const Chat = ({ route, navigation, db, storage, isConnected }) => {
    const { name, userID } = route.params;
    const bgColor = route.params.bgColor;
    const [messages, setMessages] = useState([]);

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
        if (props.currentMessage.image) {
            return renderMessageImage(props);
        }
        if (props.currentMessage.location) {
            return renderMessageLocation(props);
        }

        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: styles.bubbleRight,
                    left: styles.bubbleLeft,
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

    const renderMessageImage = (props) => {
        const { width } = Dimensions.get('window');
        const isCurrentUser = props.currentMessage.user._id === props.user._id;

        return (
            <View style={[
                styles.imageContainer,
                isCurrentUser ? styles.sentImageContainer : styles.receivedImageContainer
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
        );
    };

    const renderMessageLocation = (props) => {
        const { latitude, longitude } = props.currentMessage.location;
        const { width } = Dimensions.get('window');
        const isCurrentUser = props.currentMessage.user._id === props.user._id;

        return (
            <View style={[
                styles.imageContainer,
                isCurrentUser ? styles.sentImageContainer : styles.receivedImageContainer
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
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
    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        width: 40,
        marginRight: 5,
        marginBottom: Platform.OS === 'ios' ? 0 : 5,
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
});

export default Chat;

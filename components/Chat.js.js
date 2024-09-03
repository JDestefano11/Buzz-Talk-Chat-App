import { useState, useEffect } from "react";
import { StyleSheet, View, Platform, SafeAreaView } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Day, Send } from "react-native-gifted-chat";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from "./CustomActions";
import { Ionicons } from '@expo/vector-icons';

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
        if (isConnected) return (
            <InputToolbar
                {...props}
                containerStyle={styles.inputToolbar}
                primaryStyle={styles.inputPrimary}
            />
        );
        else return null;
    };

    const renderBubble = (props) => {
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
        <Send {...props}>
            <View style={styles.sendButton}>
                <Ionicons name="send" size={24} color="#FFD700" />
            </View>
        </Send>
    );


    const renderCustomActions = (props) => {
        return <CustomActions storage={storage} userID={userID} {...props} />;
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
                    user: doc.data().user
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
                user={{
                    _id: userID,
                    name
                }}
                scrollToBottom
                alwaysShowSend
                renderAvatar={null}
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
        padding: Platform.OS === 'ios' ? 8 : 0,
    },
    inputPrimary: {
        alignItems: 'center',
    },
    textInput: {
        color: '#FFFFFF',
        flex: 1,
        paddingHorizontal: 10,
        fontSize: 16,
        backgroundColor: '#333333',
        borderRadius: 20,
        paddingTop: Platform.OS === 'ios' ? 8 : 0,
        paddingBottom: Platform.OS === 'ios' ? 8 : 0,
        marginRight: 10,
        marginLeft: 0,
        marginTop: Platform.OS === 'ios' ? 6 : 0,
        marginBottom: Platform.OS === 'ios' ? 6 : 0,
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
});

export default Chat;
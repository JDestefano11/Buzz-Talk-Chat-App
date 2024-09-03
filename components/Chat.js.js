import { useState, useEffect } from "react";
import { StyleSheet, View, Platform } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from "./CustomActions";

const Chat = ({ route, navigation, db, storage, isConnected }) => {
    const { name, userID } = route.params;
    const [messages, setMessages] = useState([]);

    const renderInputToolbar = (props) => {
        if (isConnected) return (
            <InputToolbar
                {...props}
                containerStyle={styles.inputToolbar}
                textInputStyle={styles.textInput} // Apply white text color here
            />
        );
        else return null;
    };

    // Cache messages function
    const cacheMessages = async (messagesToCache) => {
        try {
            await AsyncStorage.setItem("messages", JSON.stringify(messagesToCache));
        } catch (error) {
            console.log(error);
        }
    };

    // Load cached messages function
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

    const renderBubble = (props) => {
        return <Bubble
            {...props}
            wrapperStyle={{
                right: {
                    backgroundColor: "#BB86FC", // User message bubble color
                    borderRadius: 15,
                    padding: 10,
                    marginBottom: 5, // Add margin for better spacing
                },
                left: {
                    backgroundColor: "#333333", // Other message bubble color
                    borderRadius: 15,
                    padding: 10,
                    marginBottom: 5, // Add margin for better spacing
                }
            }}
            textStyle={{
                right: {
                    color: "#000000", // User message text color
                },
                left: {
                    color: "#E0E0E0", // Other message text color
                }
            }}
        />
    }

    const onSend = (newMessages) => {
        if (isConnected) {
            // If online, send to Firestore and cache
            addDoc(collection(db, "messages"), newMessages[0]);
        } else {
            // If offline, cache locally
            setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
            cacheMessages([...messages, ...newMessages]);
        }
    }

    useEffect(() => {
        navigation.setOptions({ title: name });

        let unsubscribe;
        if (isConnected === true) {
            // If online, fetch from Firestore and cache
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
            // If offline, load from AsyncStorage
            loadCachedMessages();
        }

        // Clean up code
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [isConnected]);

    useEffect(() => {
        console.log("userID changed:", userID);
    }, [userID]);

    const renderCustomActions = (props) => {
        console.log("userID in Chat component:", userID);
        return <CustomActions storage={storage} userID={userID} {...props} />;
    };

    return (
        <View style={styles.container}>
            <GiftedChat
                messages={messages}
                renderBubble={renderBubble}
                renderInputToolbar={renderInputToolbar}
                onSend={messages => onSend(messages)}
                renderActions={renderCustomActions}
                user={{
                    _id: userID,
                    name
                }}
                scrollToBottom
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingTop: Platform.OS === 'ios' ? 20 : 0,
    },
    inputToolbar: {
        backgroundColor: '#1F1F1F',
        borderTopWidth: 0,
        padding: 8,
    },
    textInput: {
        color: '#E0E0E0',
        paddingHorizontal: 10,
    }
});

export default Chat;

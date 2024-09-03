import { useState, useEffect } from "react";
import { StyleSheet, View } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from "./CustomActions";
import MapView from 'react-native-maps';


const Chat = ({ route, navigation, db, storage, isConnected }) => {
    const { name, userID } = route.params;
    const [messages, setMessages] = useState([]);


    const renderInputToolbar = (props) => {
        if (isConnected) return <InputToolbar {...props} />;
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
                    backgroundColor: "#000",
                },
                left: {
                    backgroundColor: "#fff",
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
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export default Chat;
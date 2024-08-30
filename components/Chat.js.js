import { useState, useEffect } from "react";
import { StyleSheet, View } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';


const Chat = ({ route, navigation, db, storage, isConnected }) => {
    const { name, userId } = route.params;
    const [messages, setMessages] = useState([]);

    const renderInputToolbar = (props) => {
        if (isConnected) return <InputToolbar {...props} />;
        else return null;
    };

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
    };

    const onSend = (newMessages = []) => {
        if (isConnected) {
            const message = newMessages[0];
            addDoc(collection(db, "messages"), {
                ...message,
                createdAt: new Date(),
                user: {
                    _id: userId,
                    name: name
                },
                location: message.location || null
            });
        } else {
            setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
            cacheMessages([...messages, ...newMessages]);
        }
    };
    const renderCustomView = (props) => {
        const { currentMessage } = props;
        if (currentMessage.location) {
            return (
                <MapView
                    style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
                    region={{
                        latitude: currentMessage.location.latitude,
                        longitude: currentMessage.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
            );
        }
        return null;
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
                    location: doc.data().location || null
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
        <View style={styles.container}>
            <GiftedChat
                messages={messages}
                renderBubble={renderBubble}
                renderInputToolbar={renderInputToolbar}
                renderCustomView={renderCustomView}
                renderActions={(props) => <CustomActions {...props} storage={storage} onSend={onSend} />}
                onSend={messages => onSend(messages)}
                user={{
                    _id: userId,
                    name: name
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

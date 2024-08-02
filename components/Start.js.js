import { useState } from "react";
import { StyleSheet, View, Text, Button, TextInput, ImageBackground } from "react-native";

const Start = ({ navigation }) => {
    const [name, setName] = useState("");

    return (
        <ImageBackground
            source={require('../assets/splash.png')}
            style={styles.background}
        >

            <View style={styles.container}>
                <Text>Welcome to the Chat App</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                />
                <Button
                    title="Go to Chat"
                    onPress={() => navigation.navigate('Chat', { name: name })}
                />
            </View>
        </ImageBackground>
    );
};


const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        height: 40,
        width: 200,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        padding: 10,
    },
});

export default Start;


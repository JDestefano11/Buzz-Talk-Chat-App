import { useState } from "react";
import { StyleSheet, View, Text, Button, TextInput } from "react-native";

const Start = ({ navigation }) => {
    const [name, setName] = useState("");

    return (
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
    );
};

const styles = StyleSheet.create({
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


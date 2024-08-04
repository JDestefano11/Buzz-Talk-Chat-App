import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, ImageBackground, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";


const Start = ({ navigation }) => {
    const [name, setName] = useState("");
    const [bgColor, setBgColor] = useState("");

    const colors = ["#FF6347", "#4682B4", "#32CD32", "#FFD700"];


    return (
        <ImageBackground
            source={require('../assets/splash.png')}
            style={[styles.background, { backgroundColor: bgColor }]}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
                keyboardVerticalOffset={100}
            >
                <View style={styles.container}>
                    <Text>Welcome to the Chat App</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                    />
                    <View style={styles.colorPicker}>
                        {colors.map((color) => (
                            <TouchableOpacity
                                key={color}
                                style={[styles.colorCircle, { backgroundColor: color }]}
                                onPress={() => setBgColor(color)}
                            />
                        ))}
                    </View>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Chat', { name: name, bgColor: bgColor })}
                    >
                        <Text style={styles.buttonText}>Go to Chat</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    colorPicker: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    colorCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        margin: 10,
    },
    button: {
        backgroundColor: '#1E90FF',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default Start;

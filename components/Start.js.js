import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, ImageBackground, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Alert } from "react-native";
import { getAuth, signInAnonymously } from "firebase/auth";
import { StatusBar } from 'expo-status-bar';

const Start = ({ navigation }) => {
    const [name, setName] = useState("");
    const [bgColor, setBgColor] = useState("#1E1E1E");
    const [errorMessage, setErrorMessage] = useState("");
    const auth = getAuth();

    const colors = ["#1E1E1E", "#2C2C2C", "#4A90E2", "#EAEAEA"];

    const signInUser = () => {
        if (name.trim() === "") {
            setErrorMessage("Please enter your name");
            return;
        }

        signInAnonymously(auth)
            .then((userCredential) => {
                Alert.alert("Success", "You've successfully signed in!");
                navigation.navigate("Chat", {
                    userId: userCredential.user.uid,
                    name: name.trim(),
                    bgColor: bgColor,
                });
            })
            .catch((error) => {
                console.error("Error signing in:", error.message);
                setErrorMessage("An error occurred while signing in. Please try again.");
            });
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
            <StatusBar style="light" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>Welcome to BuzzTalk</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Your Name"
                        placeholderTextColor="#2C2C2C"
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            setErrorMessage("");
                        }}
                    />
                    {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                    <Text style={styles.chooseColorText}>Choose Your Chat Theme:</Text>
                    <View style={styles.colorPicker}>
                        {colors.map((color) => (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    styles.colorCircle,
                                    { backgroundColor: color },
                                    bgColor === color && styles.selectedColor
                                ]}
                                onPress={() => setBgColor(color)}
                            />
                        ))}
                    </View>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={signInUser}
                    >
                        <Text style={styles.buttonText}>Start Chatting</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        width: '88%',
        backgroundColor: 'rgba(234, 234, 234, 0.9)',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1E1E1E',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        height: 50,
        width: '100%',
        borderColor: '#2C2C2C',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
        fontSize: 16,
        fontWeight: '400',
        color: '#1E1E1E',
        backgroundColor: '#EAEAEA',
    },
    chooseColorText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#1E1E1E',
        marginBottom: 15,
    },
    colorPicker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 30,
    },
    colorCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#2C2C2C',
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: '#4A90E2',
    },
    button: {
        backgroundColor: '#4A90E2',
        padding: 15,
        borderRadius: 8,
        width: '100%',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    errorText: {
        color: '#4A90E2',
        fontSize: 14,
        marginBottom: 10,
    },
});

export default Start;

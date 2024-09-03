import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Alert, ImageBackground } from "react-native";
import { getAuth, signInAnonymously } from "firebase/auth";
import { StatusBar } from 'expo-status-bar';

const Start = ({ navigation }) => {
    const [name, setName] = useState("");
    const [bgColor, setBgColor] = useState("#1E1E1E");
    const [errorMessage, setErrorMessage] = useState("");
    const auth = getAuth();

    const colors = ["#121212", "#1F1F1F", "#333333", "#BB86FC"];

    const signInUser = () => {
        if (name.trim() === "") {
            setErrorMessage("Please enter your name");
            return;
        }

        signInAnonymously(auth)
            .then((userCredential) => {
                Alert.alert("Success", "You've successfully signed in!");
                navigation.navigate("Chat", {
                    userID: userCredential.user.uid,
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
        <ImageBackground
            source={require('../assets/backgroundimage.png')}
            style={[styles.backgroundImage, { backgroundColor: bgColor }]}
            imageStyle={{ opacity: 0.5 }}
        >
            <SafeAreaView style={styles.safeArea}>
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
                            placeholderTextColor="#E0E0E0"
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
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    safeArea: {
        flex: 1,
        backgroundColor: 'rgba(18, 18, 18, 0.6)',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        width: '88%',
        backgroundColor: 'rgba(31, 31, 31, 0.8)',
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
        color: '#E0E0E0',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        height: 50,
        width: '100%',
        borderColor: '#333333',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
        fontSize: 16,
        fontWeight: '400',
        color: '#E0E0E0',
        backgroundColor: 'rgba(51, 51, 51, 0.8)',
    },
    chooseColorText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#E0E0E0',
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
        borderColor: '#E0E0E0',
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: '#CF6679',
    },
    button: {
        backgroundColor: '#CF6679',
        padding: 15,
        borderRadius: 8,
        width: '100%',
    },
    buttonText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    errorText: {
        color: '#CF6679',
        fontSize: 14,
        marginBottom: 10,
    },
});

export default Start;

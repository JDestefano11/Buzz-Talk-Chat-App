import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Alert, ImageBackground } from "react-native";
import { getAuth, signInAnonymously } from "firebase/auth";
import { StatusBar } from 'expo-status-bar';

const Start = ({ navigation }) => {
    const [name, setName] = useState("");
    const [bgColor, setBgColor] = useState("#1E1E1E");
    const [errorMessage, setErrorMessage] = useState("");
    const auth = getAuth();

    const colors = ["#1A1A1A", "#2C2C2C", "#3D3D3D", "#D4AF37"];

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
                <Text style={styles.title}>Welcome to BuzzTalk</Text>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                >
                    <View style={styles.innerContainer}>
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
                        <Text style={styles.chooseColorText}>Choose Your Chat Theme</Text>
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
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 40,
    },
    innerContainer: {
        width: '88%',
        backgroundColor: 'rgba(31, 31, 31, 0.9)',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    title: {
        fontSize: 36,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 60,
        marginBottom: 20,
    },
    input: {
        height: 50,
        width: '100%',
        borderColor: '#4A4A4A',
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
        fontWeight: '400',
        color: '#FFFFFF',
        backgroundColor: 'rgba(74, 74, 74, 0.6)',
    },
    chooseColorText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        marginBottom: 10,
        textAlign: 'center',
        width: '100%',
    },
    colorPicker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    colorCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: '#CF6679',
    },
    button: {
        backgroundColor: '#D4AF37',
        padding: 15,
        borderRadius: 10,
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
        fontSize: 12,
        marginBottom: 8,
    },
});



export default Start;

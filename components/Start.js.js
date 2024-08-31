import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, ImageBackground, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { getAuth, signInAnonymously } from "firebase/auth";
import { StatusBar } from 'expo-status-bar';

const Start = ({ navigation }) => {
    const [name, setName] = useState("");
    const [bgColor, setBgColor] = useState("#090C08");
    const auth = getAuth();

    const colors = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];

    const signInUser = () => {
        signInAnonymously(auth)
            .then((userCredential) => {
                navigation.navigate("Chat", {
                    userId: userCredential.user.uid,
                    name: name.trim() || "Anonymous",
                    bgColor: bgColor,
                });
            })
            .catch((error) => {
                console.error("Error signing in:", error.message);
            });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <ImageBackground
                source={require('../assets/splash.png')}
                style={styles.background}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                >
                    <View style={styles.innerContainer}>
                        <Text style={styles.title}>Welcome to Chat App</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Your Name"
                            placeholderTextColor="#757083"
                            value={name}
                            onChangeText={setName}
                        />
                        <Text style={styles.chooseColorText}>Choose Background Color:</Text>
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
            </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    background: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        width: '88%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#090C08',
        marginBottom: 30,
    },
    input: {
        height: 50,
        width: '100%',
        borderColor: '#757083',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        fontSize: 16,
        fontWeight: '300',
        color: '#757083',
    },
    chooseColorText: {
        fontSize: 16,
        fontWeight: '300',
        color: '#757083',
        marginBottom: 10,
    },
    colorPicker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 30,
    },
    colorCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    selectedColor: {
        borderWidth: 2,
        borderColor: '#757083',
    },
    button: {
        backgroundColor: '#757083',
        padding: 15,
        borderRadius: 5,
        width: '100%',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default Start;

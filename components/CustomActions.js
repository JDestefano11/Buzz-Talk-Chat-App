import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useState } from 'react';

const CustomActions = ({ wrapperStyle, iconTextStyle, onSend, storage, userID }) => {
    const actionSheet = useActionSheet();

    const onActionPress = () => {
        const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
        const cancelButtonIndex = options.length - 1;

        actionSheet.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        await checkPermission('mediaLibrary', pickImage);
                        return;
                    case 1:
                        await checkPermission('camera', takePhoto);
                        return;
                    case 2:
                        await checkPermission('location', getLocation);
                        return;
                    default:
                }
            },
        );
    };

    const uploadAndSendImage = async (imageURI) => {
        try {
            const uniqueRefString = generateReference(imageURI);
            const newUploadRef = ref(storage, uniqueRefString);
            const response = await fetch(imageURI);
            const blob = await response.blob();
            const snapshot = await uploadBytes(newUploadRef, blob);
            const imageURL = await getDownloadURL(snapshot.ref);
            onSend({ image: imageURL });
        } catch (error) {
            console.error("Error uploading image:", error);
            Alert.alert("Error", "Failed to upload image. Please try again.");
        }
    }

    const checkPermission = async (permissionType, action) => {
        let permissions;
        if (permissionType === 'camera') {
            permissions = await ImagePicker.requestCameraPermissionsAsync();
        } else if (permissionType === 'mediaLibrary') {
            permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        } else if (permissionType === 'location') {
            permissions = await Location.requestForegroundPermissionsAsync();
        }

        if (permissions?.granted) {
            action();
        } else {
            Alert.alert("Permission Denied", "Please enable the required permissions in your settings.");
        }
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync();
        if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
    };

    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync();
        if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
    };

    const getLocation = async () => {
        const location = await Location.getCurrentPositionAsync({});
        if (location) {
            onSend({
                location: {
                    longitude: location.coords.longitude,
                    latitude: location.coords.latitude,
                },
            });
        } else {
            Alert.alert("Error", "Failed to fetch location. Please try again.");
        }
    };

    const generateReference = (uri) => {
        const timeStamp = Date.now();
        const imageName = uri.split("/").pop();
        return `${userID}-${timeStamp}-${imageName}`;
    }

    return (
        <TouchableOpacity style={styles.container} onPress={onActionPress}>
            <View style={[styles.wrapper, wrapperStyle]}>
                <Text style={[styles.iconText, iconTextStyle]}>+</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginBottom: 10,
    },
    wrapper: {
        borderRadius: 13,
        borderColor: '#b2b2b2',
        borderWidth: 2,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        color: '#b2b2b2',
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

export default CustomActions;

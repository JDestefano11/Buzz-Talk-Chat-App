import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert, Modal } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import MapView, { Marker } from 'react-native-maps';

const CustomActions = ({ wrapperStyle, iconTextStyle, onSend, storage, userID }) => {
    const actionSheet = useActionSheet();
    const [mapVisible, setMapVisible] = useState(false);
    const [location, setLocation] = useState(null);

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
            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
            setMapVisible(true); // Show the map when a location is obtained
        } else {
            Alert.alert("Error", "Failed to fetch location. Please try again.");
        }
    };

    const generateReference = (uri) => {
        const timeStamp = Date.now();
        const imageName = uri.split("/").pop();
        return `${userID}-${timeStamp}-${imageName}`;
    }

    const handleSendLocation = () => {
        if (location) {
            onSend({
                location: {
                    longitude: location.longitude,
                    latitude: location.latitude,
                },
            });
            setMapVisible(false); // Hide the map after sending location
        }
    };

    return (
        <View>
            <TouchableOpacity style={styles.container} onPress={onActionPress}>
                <View style={[styles.wrapper, wrapperStyle]}>
                    <Text style={[styles.iconText, iconTextStyle]}>+</Text>
                </View>
            </TouchableOpacity>

            <Modal visible={mapVisible} transparent={true} animationType="slide">
                <View style={styles.mapContainer}>
                    {location && (
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                        >
                            <Marker coordinate={location} />
                        </MapView>
                    )}
                    <TouchableOpacity style={styles.sendButton} onPress={handleSendLocation}>
                        <Text style={styles.sendButtonText}>Send Location</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
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
    mapContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    map: {
        width: '100%',
        height: '80%',
    },
    sendButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default CustomActions;

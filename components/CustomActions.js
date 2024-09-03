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
                        const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (mediaLibraryPermission.granted) {
                            pickImage();
                        } else {
                            Alert.alert("Permission Denied", "Please enable media library permissions in your settings.");
                        }
                        return;
                    case 1:
                        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                        if (cameraPermission.granted) {
                            takePhoto();
                        } else {
                            Alert.alert("Permission Denied", "Please enable camera permissions in your settings.");
                        }
                        return;
                    case 2:
                        const locationPermission = await Location.requestForegroundPermissionsAsync();
                        if (locationPermission.granted) {
                            getLocation();
                        } else {
                            Alert.alert("Permission Denied", "Please enable location permissions in your settings.");
                        }
                        return;
                    default:
                }
            },
        );
    };
    const uploadAndSendImage = async (imageURI) => {
        const uniqueRefString = generateReference(imageURI);
        const newUploadRef = ref(storage, uniqueRefString);
        const response = await fetch(imageURI);
        const blob = await response.blob();
        uploadBytes(newUploadRef, blob).then(async (snapshot) => {
            const imageURL = await getDownloadURL(snapshot.ref)
            onSend({ image: imageURL })
        });
    }

    const pickImage = async () => {
        let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissions?.granted) {
            let result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
            else Alert.alert("Permissions haven't been granted.");
        }
    }

    const takePhoto = async () => {
        let permissions = await ImagePicker.requestCameraPermissionsAsync();
        if (permissions?.granted) {
            let result = await ImagePicker.launchCameraAsync();
            if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
            else Alert.alert("Permissions haven't been granted.");
        }
    }

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

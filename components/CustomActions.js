import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CustomActions = ({ onSend, storage }) => {
    const { showActionSheetWithOptions } = useActionSheet();

    const onActionPress = () => {
        const options = ['Select an image from library', 'Take a photo', 'Share location', 'Cancel'];
        const cancelButtonIndex = options.length - 1;

        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        pickImage();
                        break;
                    case 1:
                        takePhoto();
                        break;
                    case 2:
                        getLocation();
                        break;
                    default:
                        break;
                }
            },
        );
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status === 'granted') {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });

            if (!result.canceled) {
                const imageUri = result.assets[0].uri;
                const uniqueRefString = generateReference(imageUri);
                const response = await fetch(imageUri);
                const blob = await response.blob();
                const newUploadRef = ref(storage, uniqueRefString);
                uploadBytes(newUploadRef, blob).then(async (snapshot) => {
                    const imageURL = await getDownloadURL(snapshot.ref);
                    onSend({ image: imageURL });
                });
            }
        }
    };

    const takePhoto = async () => {
        // Implement photo taking functionality
    };

    const getLocation = async () => {
        // Implement location sharing functionality
    };

    const generateReference = (uri) => {
        const timeStamp = (new Date()).getTime();
        const imageName = uri.split("/").pop();
        return `images/${timeStamp}-${imageName}`;
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onActionPress}>
            <View style={styles.wrapper}>
                <Text style={styles.iconText}>+</Text>
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

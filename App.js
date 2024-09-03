import { StyleSheet, View, Button, Image, Alert } from 'react-native';
import MapView from 'react-native-maps';
import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from "firebase/app";
import { getFirestore, disableNetwork, enableNetwork } from "firebase/firestore";
import { useNetInfo } from "@react-native-community/netinfo";
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { getStorage } from "firebase/storage";

// Import your screens
import Start from './components/Start.js';
import Chat from './components/Chat.js';

const Stack = createNativeStackNavigator();
const App = () => {
  // Firebase Configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBJLrSWBm_mefZTjDjope6kE-bhbKmDXtI",
    authDomain: "project-e73d1.firebaseapp.com",
    projectId: "project-e73d1",
    storageBucket: "project-e73d1.appspot.com",
    messagingSenderId: "180389154192",
    appId: "1:180389154192:web:cb52fa25326f2c9e15b715"
  };
  const storage = getStorage(app);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const netInfo = useNetInfo();

  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (netInfo.isConnected === false) {
      disableNetwork(db);
    } else {
      enableNetwork(db);
    }
  }, [netInfo.isConnected]);



  const HomeScreen = () => (
    <View style={styles.container}>
      <Button onPress={getLocation} title="Get MY LOCATION" />
      <Button onPress={pickImage} title="PICK AN IMAGE FROM THE LIBRARY" />
      <Button onPress={takePhoto} title="OPEN CAMERA" />
      {
        location &&
        <MapView
          style={{ width: 300, height: 200 }}
          region={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      }
      {image && <Image source={{ uri: image.uri }} style={{ width: 200, height: 200 }} />}
    </View>
  );

  return (
    <ActionSheetProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Start'>
          <Stack.Screen name="Start" component={Start} />
          <Stack.Screen name="Chat">
            {props => <Chat db={db} storage={storage} isConnected={netInfo.isConnected} {...props} />}
          </Stack.Screen>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ActionSheetProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  }
});

export default App;

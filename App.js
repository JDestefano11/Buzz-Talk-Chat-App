import { StyleSheet, View, Button, Image, Alert } from 'react-native';
import { useEffect } from 'react';
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

  const firebaseConfig = {
    apiKey: "AIzaSyBJLrSWBm_mefZTjDjope6kE-bhbKmDXtI",
    authDomain: "project-e73d1.firebaseapp.com",
    projectId: "project-e73d1",
    storageBucket: "project-e73d1.appspot.com",
    messagingSenderId: "180389154192",
    appId: "1:180389154192:web:cb52fa25326f2c9e15b715"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);




  const storage = getStorage(app);
  const db = getFirestore(app);

  const netInfo = useNetInfo();


  useEffect(() => {
    if (netInfo.isConnected === false) {
      disableNetwork(db);
    } else {
      enableNetwork(db);
    }
  }, [netInfo.isConnected]);


  return (
    <ActionSheetProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName='Start'
          screenOptions={{
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#1E1E1E',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Start"
            component={Start}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Chat"
            options={({ route }) => ({ title: route.params.name })}
          >
            {props => <Chat db={db} storage={storage} isConnected={netInfo.isConnected} {...props} />}
          </Stack.Screen>
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

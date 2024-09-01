import Start from './components/Start.js';
import Chat from './components/Chat.js';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { useNetInfo } from "@react-native-community/netinfo";
import { disableNetwork, enableNetwork } from "firebase/firestore";
import { useEffect } from 'react';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

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

  const app = initializeApp(firebaseConfig);
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
        <Stack.Navigator initialRouteName='Start'>
          <Stack.Screen name="Start" component={Start} />
          <Stack.Screen name="Chat">
            {props => <Chat db={db} isConnected={netInfo.isConnected} {...props} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </ActionSheetProvider>
  );
}

export default App;

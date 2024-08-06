import Start from './components/Start.js';
import Chat from './components/Chat.js';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const Stack = createNativeStackNavigator();

const App = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyAms6BJfTk4kFHL0IiO-w9HEpYlxIN3yHg",
    authDomain: "chat-868cd.firebaseapp.com",
    projectId: "chat-868cd",
    storageBucket: "chat-868cd.appspot.com",
    messagingSenderId: "283916649578",
    appId: "1:283916649578:web:34da2782ffe5096f23b613"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Start'>
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Chat">
          {props => <Chat db={db} {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

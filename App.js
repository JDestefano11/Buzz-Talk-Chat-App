import screen1 from './components/screen1';
import screen2 from './components/screen2';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


const Stack = createNativeStackNavigator();




const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName='Screen1'
      >
        <Stack.Screen name="Screen1" component={screen1} />
        <Stack.Screen name="Screen2" component={screen2} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}







const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});




export default App; 
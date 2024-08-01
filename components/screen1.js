import { StyleSheet, View, Text, Button } from "react-native";

const Screen1 = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text>Screen 1</Text>
            <Button
                title="Go to Screen 2"
                onPress={() => navigation.navigate('Screen2')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Screen1;


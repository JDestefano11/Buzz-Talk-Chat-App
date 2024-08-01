import { StyleSheet, View, Text } from "react-native";

const Screen2 = () => {
    return (
        <View style={styles.container}>
            <Text>Screen 2</Text>
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


export default Screen2;
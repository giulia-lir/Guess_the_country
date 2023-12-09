import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function SignInUser({ auth }) {
    const [userSetUp, setUserSetUp] = useState({
        email: '',
        password: '',
    });

    const handleUserLogIn = () => {
        signInWithEmailAndPassword(auth, userSetUp.email, userSetUp.password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                setUserSetUp({ email: '', password: '' })
                Alert.alert('Success', 'You are logged in!');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                let alertTitle = 'Registration Failed';
                let alertMessage = 'Something went wrong. Please try again.';

                if (errorCode === 'auth/email-already-in-use') {
                    alertMessage = 'The email address is already in use by another account.';
                } else if (errorCode === 'auth/invalid-email') {
                    alertMessage = 'The email address is not valid.';
                } else if (errorCode === 'auth/weak-password') {
                    alertMessage = 'The password is too weak. Please choose a stronger password.';
                }

                console.log(errorCode, errorMessage);

                Alert.alert(alertTitle, alertMessage);
            });

    };

    console.log('Sign In render')
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={userSetUp.email}
                onChangeText={(text) => setUserSetUp({ ...userSetUp, email: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={userSetUp.password}
                onChangeText={(text) => setUserSetUp({ ...userSetUp, password: text })}
            />
            <Button title="Sign In" onPress={handleUserLogIn} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        padding: 8,
        width: '80%',
    },
});

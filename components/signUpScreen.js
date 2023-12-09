import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function CreateUser({ auth }) {
    const [userSetUp, setUserSetUp] = useState({
        email: '',
        password: '',
    });

    const validateEmail = (email) => {
        // Regular expression for basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.\nExample: john.doe@example.com');
        }
    };

    const validatePassword = (password) => {
        // Validation here
    };

    const handleUserCreation = () => {
        // Additional validation can be added here if needed
        validateEmail(userSetUp.email);

        createUserWithEmailAndPassword(auth, userSetUp.email, userSetUp.password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                // ...
                setUserSetUp({ email: '', password: '' })
                Alert.alert('Success', 'User created successfully!');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage)
                // ..
            });

    };

    console.log('Sign Up render')
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create account</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={userSetUp.email}
                onChangeText={(text) => setUserSetUp({ ...userSetUp, email: text })}
                onBlur={() => validateEmail(userSetUp.email)}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={userSetUp.password}
                onChangeText={(text) => setUserSetUp({ ...userSetUp, password: text })}
                onBlur={() => validatePassword(userSetUp.password)}
            />
            <Button title="Sign In" onPress={handleUserCreation} />
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

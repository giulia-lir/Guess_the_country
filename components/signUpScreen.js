// SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


export default function CreateUser({ app }) {
    const auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
    const [userSetUp, setUserSetUp] = useState({
        email: '',
        password: '',
    });

    const validateEmail = (email) => {
        // Regular expression for basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.\nExample: john.doe@example.com');
            // You can set an error state or display an error message to the user
        }
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

    /* const auth = getAuth();
    createUserWithEmailAndPassword(auth, userSetUp.email, userSetUp.password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        }); */
        console.log('Sign Up render')
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In</Text>
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

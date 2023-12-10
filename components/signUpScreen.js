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

        // Better email validation to consider with Firebase service
    };

    const validatePassword = (password) => {
        if (password.trim() === '') {
            Alert.alert('Invalid password', 'Password cannot be empty. It must be at least 6 characters.')
        }
        if (password.length < 6) {
            Alert.alert('Invalid password', 'Password is too short. It must be at least 6 characters.')
        }
        // More validation with Regex for digits and special characters checking
    };

    const handleUserCreation = () => {
        validateEmail(userSetUp.email);

        createUserWithEmailAndPassword(auth, userSetUp.email, userSetUp.password)
            .then((userCredential) => {
                const user = userCredential.user;
                setUserSetUp({ email: '', password: '' })
                Alert.alert('Account Created', 'Congratulations! Your account has been created successfully!');
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
                Alert.alert(alertTitle, alertMessage);
            });

    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create account</Text>
            <TextInput
                style={styles.input}
                inputMode='email'
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
            <Button title="Create account" onPress={handleUserCreation} />
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

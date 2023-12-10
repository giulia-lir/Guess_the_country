import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';

export default function Nickname({ db, currentNickName, setCurrentNickname, getNickname, isNicknameSaved, setIsNicknameSaved }) {
    const [newNickName, setNewNickname] = useState('');

    const cancelEdit = () => {
        setNewNickname(currentNickName);
        setIsNicknameSaved(true);
    };

    const openEditField = () => {
        setIsNicknameSaved(false);
    };

    const saveNickname = () => {
        if (newNickName != currentNickName && newNickName.trim() != "") {
            db.transaction(
                tx => {
                    tx.executeSql('SELECT nickname FROM player_info WHERE id = ?;', [1], (_, { rows }) => {
                        if (rows.length > 0) {
                            tx.executeSql('UPDATE player_info SET nickname = ? WHERE id = ?;', [newNickName, 1]);
                            setCurrentNickname(newNickName)
                        } else {
                            tx.executeSql('INSERT INTO player_info (nickname) VALUES (?);', [newNickName]);
                            setCurrentNickname(newNickName)
                        }
                    },
                        (_, error) => console.error('Error saving nickname:', error),
                        getNickname)
                    setIsNicknameSaved(true)
                },
            );
        }
    };

    return (
        <View>
            {!isNicknameSaved ? (
                <View style={styles.inputContainer}>
                    <Text style={styles.titleStyle}>Enter your nickname:</Text>
                    <TextInput
                        style={styles.inputStyle}
                        value={newNickName}
                        onChangeText={(text) => setNewNickname(text)}
                        placeholder={currentNickName ? currentNickName : "Nickname"}
                        maxLength={20}
                    />
                    <Button title="Save Nickname" onPress={saveNickname} />
                    <Button title="Cancel" onPress={cancelEdit} />
                </View>
            ) : (
                <View style={styles.editButtonContainer}>
                    <Text style={styles.welcomeText}>Hello {currentNickName}!</Text>
                    <Button title="Edit" onPress={openEditField} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    titleStyle: {
        fontFamily: 'PlaypenSansBold',
        fontSize: 30,
        color: 'black',
    },
    inputStyle: {
        height: 40,
        width: '80%',
        borderColor: 'gray',
        borderWidth: 1,
        marginVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#ecf0f1',
    },
    welcomeText: {
        fontFamily: 'PlaypenSansBold',
        fontSize: 24,
        color: 'black',
        marginVertical: 20,
    },
});
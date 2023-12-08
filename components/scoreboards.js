import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, TextInput, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { initializeApp } from "firebase/app";
import { getDatabase, push, ref, onValue } from 'firebase/database';

// SQLite local DB
const db = SQLite.openDatabase('countriesdb.db');

// Firebase DB connection
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_key,
    authDomain: process.env.EXPO_PUBLIC_domain,
    databaseURL: process.env.EXPO_PUBLIC_dburl,
    projectId: process.env.EXPO_PUBLIC_projectId,
    storageBucket: process.env.EXPO_PUBLIC_storage_bucket,
    messagingSenderId: process.env.EXPO_PUBLIC_senderId,
    appId: process.env.EXPO_PUBLIC_appId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firedb = getDatabase(app);

export default function Scoreboards({ navigation }) {
    const [scoreList, setScoreList] = useState([]);
    const [currentNickName, setCurrentNickname] = useState('');
    const [newNickName, setNewNickname] = useState('');
    const [isNicknameSaved, setIsNicknameSaved] = useState(false);

    const getScoreList = () => {
        db.transaction(tx => {
            tx.executeSql('select * from endless_scores;', [], (_, { rows }) => {
                results = rows._array
                helper = [...results].sort((a, b) => b.endless_score - a.endless_score)
                //console.log(helper)
                setScoreList([...results].sort((a, b) => b.endless_score - a.endless_score))
                //setHighestScore(scoreList[0])
            }
            ), (_, error) => console.error('Error fetching scores:', error)
        });
    }

    const getNickname = () => {
        db.transaction(tx => {
            tx.executeSql('select nickname from player_info where id = ?;', [1], (_, { rows }) => {
                const playerInfo = rows._array[0];
                setCurrentNickname(playerInfo ? playerInfo.nickname : '');
                setNewNickname(playerInfo ? playerInfo.nickname : '');
                setIsNicknameSaved(playerInfo ? true : false);
                //console.log(rows._array)
            }, (_, error) => {
                console.error('Error fetching nickname:', error);
            });
        });
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

    const cancelEdit = () => {
        setNewNickname(currentNickName);
        setIsNicknameSaved(true);
    };

    const openEditField = () => {
        setIsNicknameSaved(false);
    };

    const deleteNicknameTable = () => {
        console.log("Delete the damn table")
        db.transaction(
            tx => {
                tx.executeSql('drop table if exists player_info;');
            }, (_, error) => console.error('Error deleting player_info table:', error)
        )
    }

    const deleteScore = (id) => {
        db.transaction(
            tx => {
                tx.executeSql('delete from endless_scores where id = ?;', [id]);
            }, (_, error) => console.error('Error deleting score:', error), getScoreList
        )
    }

    const saveScore = () => {
        push(ref(firedb, 'leaderBoard/'), scoreList[0].endless_score);
    }

    useFocusEffect(
        React.useCallback(() => {
            getScoreList();
            getNickname();
        }, [])
    );

    return (
        <LinearGradient
            colors={['#6200EA', '#4A148C', '#1565C0', '#00C853', '#FFD600', '#FF6D00', '#D500F9']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.viewStyle}
        >
            {!isNicknameSaved ? (
                <View style={styles.inputContainer}>
                    <Text style={styles.titleStyle}>Enter your nickname:</Text>
                    <TextInput
                        style={styles.inputStyle}
                        value={newNickName}
                        onChangeText={(text) => setNewNickname(text)}
                        placeholder="Nickname"
                        maxLength={20}
                    />
                    <Button title="Save Nickname" onPress={saveNickname} />
                    <Button title="Cancel" onPress={cancelEdit} />
                </View>
            ) : (
                <View style={styles.editButtonContainer}>
                    <Text style={styles.welcomeText}>Hello {newNickName}!</Text>
                    <Button title="Edit" onPress={openEditField} />
                    <Button title="Delete table" onPress={deleteNicknameTable} />
                </View>
            )}
            <Button title="Save to Leaderboard" onPress={saveScore} />
            <Text style={styles.titleStyle}>Your best scores</Text>
            {/* <Button title="Show List" onPress={getScoreList} /> */}
            {scoreList.length > 0 ? (
                <FlatList
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item, index }) =>
                        <View style={styles.itemStyle}>
                            <Text>{index + 1}:</Text>
                            <Text>{currentNickName}</Text>
                            <Text style={styles.fontStyleBold}>{item.endless_score}</Text>
                            {/* <Text style={{ color: '#0000ff' }} onPress={() => deleteScore(item.id)}>Delete</Text> */}
                        </View>
                    }
                    data={scoreList}
                    showsVerticalScrollIndicator={true}
                    style={styles.flatListStyle}
                />
            ) : (
                <Text>No scores saved</Text>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    viewStyle: {
        alignItems: 'center',
        backgroundColor: '#3498db',
        height: '100%',
    },
    welcomeText: {
        fontFamily: 'PlaypenSansBold',
        fontSize: 24,
        color: 'black',
        marginVertical: 20,
    },
    titleStyle: {
        fontFamily: 'PlaypenSansBold',
        fontSize: 30,
        color: 'black',
    },
    fontStyleBold: {
        fontFamily: 'PlaypenSansBold',
        fontSize: 20,
        color: 'black'
    },
    flatListStyle: {
        width: '90%',
    },
    itemStyle: {
        width: '100%',
        backgroundColor: 'white',
        borderColor: '#05395B',
        borderRadius: 15,
        borderBottomWidth: 5,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 5,
        paddingVertical: 10,
        marginBottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    inputContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    inputStyle: {
        height: 40,
        width: '80%',
        borderColor: 'gray',
        borderWidth: 1,
        marginVertical: 10,
        paddingHorizontal: 10,
    },
});
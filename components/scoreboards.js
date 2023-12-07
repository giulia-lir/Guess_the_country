import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
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
    //const [highestScore, setHighestScore] = useState(0);
    //const [leaderBoard, setLeaderBoard] = useState([]);

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
        }, [])
    );

    return (
        <LinearGradient
            colors={['#6200EA', '#4A148C', '#1565C0', '#00C853', '#FFD600', '#FF6D00', '#D500F9']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.viewStyle}
        >
            <Button title= "Save to Leaderboard" onPress={saveScore}/>
            <Text style={styles.titleStyle}>Your best scores</Text>
            {/* <Button title="Show List" onPress={getScoreList} /> */}
            {scoreList.length > 0 ? (
                <FlatList
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item, index }) =>
                        <View style={styles.itemStyle}>
                            <Text>{index + 1}:</Text>
                            <Text>Test</Text>
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
});
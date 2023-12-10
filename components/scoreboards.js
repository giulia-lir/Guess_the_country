import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { initializeApp } from "firebase/app";
import { getDatabase, push, ref, onValue } from 'firebase/database';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import withCollapsibleState from './collapsibleHighFunction';
import PersonalCollapsibleFlatList from './collapsiblePersonalScoreList';
import LeaderboardCollapsibleFlatList from './collapsibleLeaderboard';
import Nickname from './nickname';


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
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export default function Scoreboards({ navigation }) {
    const [scoreList, setScoreList] = useState([]);
    const [currentNickName, setCurrentNickname] = useState(null);
    const [isNicknameSaved, setIsNicknameSaved] = useState(false);

    const PersonalCollapsibleWithState = withCollapsibleState(PersonalCollapsibleFlatList);
    const LeaderboardCollapsibleWithState = withCollapsibleState(LeaderboardCollapsibleFlatList);

    const getNickname = () => {
        console.log('getnickname called')
        setTimeout(() => {
            db.transaction(tx => {
                tx.executeSql('select nickname from player_info where id = ?;', [1], (_, { rows }) => {
                    const playerInfo = rows._array[0];
                    console.log('load sql playerinfo', playerInfo)
                    setCurrentNickname(playerInfo ? playerInfo.nickname : null);
                    //setNewNickname(playerInfo ? playerInfo.nickname : '');
                    setIsNicknameSaved(playerInfo ? true : false);
                    //console.log(rows._array)
                }, (_, error) => {
                    console.error('Error fetching nickname:', error);
                });
            });
        }, 1000)
    };

    console.log('Scoreboard render')

    const getScoreList = () => {
        db.transaction(tx => {
            tx.executeSql('select * from endless_scores;', [], (_, { rows }) => {
                results = rows._array
                setScoreList([...results].sort((a, b) => b.endless_score - a.endless_score))
            }
            ), (_, error) => console.error('Error fetching scores:', error)
        });
    }

    const deleteNicknameTable = () => {
        console.log("Delete the damn table")
        db.transaction(
            tx => {
                tx.executeSql('drop table if exists player_info;');
            }, (_, error) => console.error('Error deleting player_info table:', error)
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

    useEffect(() => {
        getNickname();
        getScoreList();
    }, []);

    return (
        <LinearGradient
            colors={['#6200EA', '#4A148C', '#1565C0', '#00C853', '#FFD600', '#FF6D00', '#D500F9']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.viewStyle}
        >
            <Nickname
                db={db}
                getNickname={getNickname}
                currentNickName={currentNickName}
                isNicknameSaved={isNicknameSaved}
                setIsNicknameSaved={setIsNicknameSaved}
                setCurrentNickname={setCurrentNickname}
            />
            {/* <Button title="Save to Leaderboard" onPress={saveScore} /> */}
            <ScrollView>
                <PersonalCollapsibleWithState
                    scoreList={scoreList}
                    currentNickName={currentNickName}
                />
                <LeaderboardCollapsibleWithState
                    scoreList={scoreList}
                    currentNickName={currentNickName}
                    app={app}
                    auth={auth}
                    firedb={firedb}
                />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    viewStyle: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
});
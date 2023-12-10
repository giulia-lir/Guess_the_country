import React, { useState, useEffect } from 'react';
import { Alert, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { ref, push, update, onValue, child } from 'firebase/database';
import { signOut } from "firebase/auth";
import CreateUser from './signUpScreen';
import SignInUser from './signInScreen';


export default function LeaderboardCollapsibleFlatList({ isCollapsed, openCollapsible, scoreList, currentNickName, app, auth, firedb }) {
    const [userAuthenticated, setUserAuthenticated] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [playerInfo, setPlayerInfo] = useState({
        playerId: null,
        nickname: currentNickName,
        highestScore: scoreList.length > 0 ? scoreList[0].endless_score : 0,
    });
    const [showPushScoreButton, setShowPushScoreButton] = useState(false);

    console.log(playerInfo)

    const handleSignOut = () => {
        signOut(auth).then(() => {
            setUserAuthenticated(false);
            Alert.alert('Sign Out Successful', 'You have been successfully signed out.');
        }).catch((error) => {
            Alert.alert('Sign Out Failed', 'An error occurred while signing out. Please try again.');
        });
    };

    useEffect(() => {
        // Check user authentication status
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserAuthenticated(true);
                const userUid = auth.currentUser.uid;
                const info = {
                    ...playerInfo,
                    playerId: userUid
                }
                if (playerInfo.playerId === null) {
                    setPlayerInfo(info);
                }
                // If user is authenticated, fetch leaderboard data
                onValue(ref(firedb, '/leaderboard'), (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        setLeaderboardData(Object.values(data).sort((a, b) => b.highestScore - a.highestScore));
                        const isEligible = checkEligibilityForLeaderboard(Object.values(data), info);
                        setShowPushScoreButton(isEligible);
                    } else {
                        setLeaderboardData([]);
                        setShowPushScoreButton(true); // because the array is empty so can push score
                    }
                })
            } else {
                setUserAuthenticated(false);
            }
        });
        // Cleanup subscription when component unmounts
        return () => unsubscribe();
    }, [auth, scoreList]);

    const checkEligibilityForLeaderboard = (leaderboardData, info) => {
        console.log('eligibility check starts')
        // Check if user is authenticated
        //console.log('userAuth: ', userAuthenticated)
        // if (userAuthenticated) {
        // If leaderboard is empty
        console.log(leaderboardData.length)
        if (leaderboardData.length === 0) {
            console.log('length was zero')
            return true;
        }
console.log('the heck you print here', leaderboardData.findIndex(entry => entry.playerId === info.playerId))
console.log('just leaderboard player id: ', leaderboardData.findIndex(entry => entry.playerId))
console.log('info player id: ', info.playerId)
        if (leaderboardData.findIndex(entry => entry.playerId === info.playerId) === -1) { //playerInfo.playerId
            console.log('find index true')
            return true;
        } else {
            console.log('check score:' + info.highestScore + ', against leaderboard:' + leaderboardData[leaderboardData.findIndex(entry => entry.playerId === info.playerId)].highestScore)
            if (info.highestScore > leaderboardData[leaderboardData.findIndex(entry => entry.playerId === info.playerId)].highestScore) {

                console.log('find index nested if true')
                return true;
            }
            console.log('find index false')
            return false;
        }
        // };
        // console.log('eligibility if failed')
        // return false;

    };

    const handlePushScore = () => {
        //console.log('Leaderboard state before push: ', leaderboardData)
        // Check if the user is authenticated
        // if (userAuthenticated) {
        const userEntryIndex = leaderboardData.findIndex(entry => entry.playerId === playerInfo.playerId);
        //console.log(leaderboardData.findIndex(entry => entry.playerId === playerInfo.playerId))

        if (userEntryIndex !== -1) {
            // User already has an entry in the leaderboard
            if (playerInfo.highestScore > leaderboardData[userEntryIndex].highestScore) {
                // Update the score if the new score is higher
                leaderboardData[userEntryIndex].highestScore = playerInfo.highestScore;
                // Update the leaderboard in Firebase
                update(child(ref(firedb, '/leaderboard'), playerInfo.playerId), playerInfo);
            }
        } else {
            // User doesn't have an entry, add a new one
            push(ref(firedb, '/leaderboard'), playerInfo);
        }

        // Refresh the leaderboard data
        onValue(ref(firedb, '/leaderboard'), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const leaderboardArray = Object.values(data);
                setLeaderboardData(leaderboardArray);
            } else {
                setLeaderboardData([]);
            }
        });

        setShowPushScoreButton(false);
        // console.log('Leaderboard state after push: ', leaderboardData);
    }

    return (
        <View style={styles.flatListContainer}>
            <Pressable
                onPress={() => openCollapsible()}
                style={({ pressed }) => [
                    styles.pressablePersonalScoreStyle,
                    pressed && styles.pressablePressedStyle,
                ]}>
                <Text style={styles.titleStyle}>See Leaderboard</Text>
            </Pressable>
            {isCollapsed && (
                <View style={{ flex: 1 }}>
                    {userAuthenticated ? (
                        // If user is authenticated, show leaderboard
                        <ScrollView style={styles.scoreListStyle}>
                            <Pressable onPress={handleSignOut}>
                                <Text>Sign out</Text>
                            </Pressable>
                            {leaderboardData.length > 0 ? (
                                leaderboardData.map((item, index) => (
                                    <View key={index} style={styles.itemStyle}>
                                        <Text>{index + 1}:</Text>
                                        <Text>{item.nickname}</Text>
                                        <Text style={styles.fontStyleBold}>{item.highestScore}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text>No score saved in leaderboard yet.</Text>
                            )}
                            {showPushScoreButton && (
                                <Pressable onPress={handlePushScore}>
                                    <Text>Push Score</Text>
                                </Pressable>
                            )}
                        </ScrollView>
                    ) : (
                        // If user is not authenticated, show sign-in and sign-up options
                        <View>
                            <Text>Sign in or create an account to see the leaderboard</Text>
                            <SignInUser auth={auth} />
                            <Text>or</Text>
                            <CreateUser auth={auth} />
                        </View>
                    )}
                    {/* <Text>Sign in or create an account to see the leaderboard</Text>
                    <SignInUser auth={auth} />
                    <Text>or</Text>
                    <CreateUser auth={auth} /> */}
                </View>
            )}
        </View >
    );
};
const styles = StyleSheet.create({
    flatListContainer: {
        flex: 1,
        height: 'auto',
        alignContent: 'center',
        alignItems: 'center',
    },
    pressablePersonalScoreStyle: {
        width: '100%',
        backgroundColor: 'white',
        borderColor: '#05395B',
        borderRadius: 15,
        borderBottomWidth: 5,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 5,
        padding: 10,
        margin: 10,
    },
    pressablePressedStyle: {
        backgroundColor: '#BBB5B5',
    },
    titleStyle: {
        fontFamily: 'PlaypenSansBold',
        fontSize: 30,
        color: 'black',
    },
    scoreListStyle: {
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
    fontStyleBold: {
        fontFamily: 'PlaypenSansBold',
        fontSize: 20,
        color: 'black'
    },
});
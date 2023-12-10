import React, { useState, useEffect } from 'react';
import { Alert, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { ref, push, onValue } from 'firebase/database';
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
                // If user is authenticated, fetch leaderboard data
                onValue(ref(firedb, '/leaderBoard'), (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const leaderboardArray = Object.values(data);
                        setLeaderboardData(leaderboardArray);
                        const isEligible = checkEligibilityForLeaderboard(leaderboardArray);
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

    const checkEligibilityForLeaderboard = (leaderboardArray) => {
        if (leaderboardArray.length === 0) {
            return true;
        }

        // Assuming leaderboard array is sorted in DESC order
        const lowestScore = leaderboardArray[leaderboardArray.length - 1].score;
        return userHighscore > lowestScore;
    };

    const handlePushScore = () => {
        console.log('Leaderboard state before push: ', leaderboardData)
        // Check if the user is authenticated
        if (userAuthenticated) {
            const userUid = auth.currentUser.uid;
            if (playerInfo.playerId === null) {
                setPlayerInfo((prevPlayerInfo) => ({
                    ...prevPlayerInfo,
                    playerId: userUid,
                }));
            }
            setPlayerInfo({ ...playerInfo, playerId: userUid })
            console.log('See the player info: ', playerInfo)
            const userEntryIndex = leaderboardData.findIndex(entry => entry.uid === playerInfo.playerId);
            console.log(userEntryIndex)

            if (userEntryIndex !== -1) {
                // User already has an entry in the leaderboard
                if (playerInfo.score > leaderboardData[userEntryIndex].score) {
                    // Update the score if the new score is higher
                    leaderboardData[userEntryIndex].score = playerInfo.score;
                    // Update the leaderboard in Firebase
                    push(ref(firedb, '/leaderboard'), playerInfo);
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
            console.log('Leaderboard state after push: ', leaderboardData);
        }
    };

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
                        <ScrollView>
                            <Pressable onPress={handleSignOut}>
                                <Text>Sign out</Text>
                            </Pressable>
                            {leaderboardData.length > 0 ? (
                                leaderboardData.map((item, index) => (
                                    <View key={index}>
                                        <Text>{item.nickname}</Text>
                                        <Text>{item.score}</Text>
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
});
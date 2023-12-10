import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, ScrollView } from 'react-native';
import { getDatabase, ref, push, onValue } from 'firebase/database';
import CreateUser from './signUpScreen';
import SignInUser from './signInScreen';


export default function LeaderboardCollapsibleFlatList({ isCollapsed, openCollapsible, app, auth, firedb }) {
    const [userAuthenticated, setUserAuthenticated] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);


    // useEffect(() => {
    //     onValue(ref(firedb, '/leaderBoard'), (snapshot) => {
    //         const data = snapshot.val();
    //         // Object.values() extracts the values from the key in object array, Object.keys() is used to get the keys instead
    //         setLeaderboardData(Object.values(data))
    //     })
    // }, []);


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
                    } else {
                        setLeaderboardData([]);
                    }
                })
            } else {
                setUserAuthenticated(false);
            }
        });

        // Cleanup subscription when component unmounts
        return () => unsubscribe();
    }, [auth]);

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
                            {leaderboardData.length > 0 ? (
                                leaderboardData.map((item) => (
                                    <View key={item.id}>
                                        <Text>{item.username}</Text>
                                        <Text>{item.score}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text>No score saved in leaderboard yet.</Text>
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
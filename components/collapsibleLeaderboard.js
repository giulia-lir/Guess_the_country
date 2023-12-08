import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';

export default function LeaderboardCollapsibleFlatList({ isCollapsed, openCollapsible }) {
    
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
                    <Text>No scores saved</Text>
                </View>
            )}
        </View>
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
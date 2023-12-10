import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';

export default function PersonalCollapsibleFlatList({ isCollapsed, openCollapsible, scoreList, currentNickName }) {

    return (
        <View style={styles.flatListContainer}>
            <Pressable
                onPress={openCollapsible}
                style={({ pressed }) => [
                    styles.pressablePersonalScoreStyle,
                    pressed && styles.pressablePressedStyle,
                ]}>
                <Text style={styles.titleStyle}>See your best scores</Text>
            </Pressable>

            {isCollapsed && (
                <View style={{ flex: 1 }}>
                    {scoreList.length > 0 ? (
                        <ScrollView style={styles.scoreListStyle}>
                            {scoreList.map((item, index) => (
                                <View key={item.id} style={styles.itemStyle}>
                                    <Text>{index + 1}:</Text>
                                    <Text>{currentNickName}</Text>
                                    <Text style={styles.fontStyleBold}>{item.endless_score}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <Text>No scores saved</Text>
                    )}
                </View>
            )
            }
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
    collapsibleContent: {
        width: '100%',
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
    scoreListStyle: {
        width: '90%',
    },
});
import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';

export default function PersonalCollapsibleFlatList({ scoreList, currentNickName }) {
    const [isCollapsed, setCollapsed] = useState(true);

    const togglePersonalCollapsible = () => {
        setCollapsed(!isCollapsed);
    };

    /* const deleteScore = (id) => {
        db.transaction(
            tx => {
                tx.executeSql('delete from endless_scores where id = ?;', [id]);
            }, (_, error) => console.error('Error deleting score:', error), getScoreList
        )
    } */

    return (
        <View style={styles.flatListContainer}>
            <Pressable onPress={togglePersonalCollapsible}>
                <Text style={styles.titleStyle}>See your best scores</Text>
            </Pressable>

            {isCollapsed && (
                <View style={{ flex: 1 }}>
                    {scoreList.length > 0 ? (
                        <FlatList
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item, index }) => (
                                <View style={styles.itemStyle}>
                                    <Text>{index + 1}:</Text>
                                    <Text>{currentNickName}</Text>
                                    <Text style={styles.fontStyleBold}>{item.endless_score}</Text>
                                    {/* <Text style={{ color: '#0000ff' }} onPress={() => deleteScore(item.id)}>Delete</Text> */}
                                </View>
                            )}
                            data={scoreList}
                            showsVerticalScrollIndicator={true}
                            style={styles.flatListStyle}
                        />
                    ) : (
                        <Text>No scores saved</Text>
                    )}
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
    titleStyle: {
        fontFamily: 'PlaypenSansBold',
        fontSize: 30,
        color: 'black',
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
    flatListStyle: {
        width: '90%',
    },
});
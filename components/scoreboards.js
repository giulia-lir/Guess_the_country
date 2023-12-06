import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';


const db = SQLite.openDatabase('countriesdb.db');

export default function Scoreboards({ navigation }) {
    const [scoreList, setScoreList] = useState([]);

    const getScoreList = () => {

        db.transaction(tx => {
            tx.executeSql('select * from endless_scores;', [], (_, { rows }) => {
                results = rows._array
                helper = [...results].sort((a, b) => b.endless_score - a.endless_score)
                //console.log(helper)
                setScoreList([...results].sort((a, b) => b.endless_score - a.endless_score))
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

    useFocusEffect(
        React.useCallback(() => {
            getScoreList();
        }, [])
    );

    return (
        <View style={styles.viewStyle}>
            <Text style={styles.titleStyle}>Your best scores</Text>
            {/* <Button title="Show List" onPress={getScoreList} /> */}
            {scoreList.length > 0 ? (
                <FlatList
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) =>
                        <View style={styles.itemStyle}>
                            <Text>Test</Text>
                            <Text style={styles.fontStyleBold}>{item.endless_score}</Text>
                            {/* <Text style={{ color: '#0000ff' }} onPress={() => deleteScore(item.id)}>Delete</Text> */}
                        </View>
                    }
                    data={scoreList}
                    showsVerticalScrollIndicator={true}
                />
            ) : (
                <Text>No scores saved</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    viewStyle: {
        alignItems: 'center',
        backgroundColor: 'red'
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
    itemStyle: {
        width: '100%',
        backgroundColor: 'white',
        borderBottomColor: 'grey',
        borderWidth: 2,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
});
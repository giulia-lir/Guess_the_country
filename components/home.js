import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Alert, View, ScrollView, StyleSheet, Text, Button, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SQLite from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import GuessTheFlagGame from './game';
import EndlessQuizChallenge from './endless_quiz';

const db = SQLite.openDatabase('countriesdb.db');
const API_URL = 'https://restcountries.com/v2/all';

export default function Home() {

  const [countriesList, setCountriesList] = useState([]);
  const [startGame, setStartGame] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState();
  const uniqueRegions = new Set();
  const [startEndlessQuiz, setStartEndlessQuiz] = useState(false);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('create table if not exists countries (id integer primary key not null, name text, flag text, region text);');
    }, () => console.error("Error when creating DB"),);

    db.transaction(tx => {
      tx.executeSql('create table if not exists endless_scores (id integer primary key not null, endless_score integer);');
    }, () => console.error("Error when creating DB"),);

    console.log('hi im elfo')
    db.transaction(tx => {
      tx.executeSql('select * from countries', [], (_, { rows }) => {
        console.log(rows._array.length)
        if (rows._array.length > 0) {
          const countriesFromDB = Array.from(rows._array).map(row => ({
            id: row.id,
            name: row.name,
            flag: row.flag,
            region: row.region,
          }));

          //console.log('Countries from DB:', countriesFromDB); // Log the countries fetched from the database
          setCountriesList(countriesFromDB);

        } else {
          console.log('No records found in the database.');
          fetchCountries();
        }
      });
    }, () => console.error("Error when loading from DB"),)
    /*
    
    db.transaction(tx => {
      tx.executeSql('drop table if exists countries;');
    }, () => console.error("Error when deliting tables in DB"), ); 
    */
  }, []);

  const fetchCountries = () => {
    if (countriesList.length === 0) {
      fetch(API_URL)
        .then(response => response.json())
        .then(data => {
          const countries = data.map(country => ({
            name: country.name,
            flag: country.flags.png,
            region: country.region,
          })
          );

          setCountriesList(countries);

          countries.forEach(country => {
            db.transaction(tx => {
              tx.executeSql(
                'INSERT OR IGNORE INTO countries (name, flag, region) VALUES (?, ?, ?);',
                [country.name, country.flag, country.region],
                (_, resultSet) => {
                  if (resultSet.rowsAffected > 0) {
                    console.log(`Country "${country.name}" inserted into the database.`);
                  } else {
                    console.log(`Country "${country.name}" already exists in the database.`);
                  }
                },
                (_, error) => {
                  console.error(`Error inserting country "${country.name}" into the database:`, error);
                }
              );
            });
          });
        })
        .catch(err => {
          Alert.alert('Error', err.message)
        });

    }
  }

  const pickerRef = useRef();

  function open() {
    pickerRef.current.focus();
  }

  function close() {
    pickerRef.current.blur();
  }

  const handleStartGame = () => {
    setStartGame(true);
  };

  const handleQuitGame = () => {
    setStartGame(false);
  };

  const handleStartEndlessQuiz = () => {
    setStartEndlessQuiz(true);
  };

  const handleQuitEndlessQuiz = () => {
    setStartEndlessQuiz(false);
  };

  countriesList
    .filter(country => country.region !== undefined && country.region !== '')
    .forEach(country => uniqueRegions.add(country.region));

  const pickerItems = [...uniqueRegions].map((region, index) => {
    const countriesInRegion = countriesList.filter(country => country.region === region);

    // Check to exclude regions such as Polar or Antarctica with less than 15 countries
    if (countriesInRegion.length >= 15) {
      return <Picker.Item key={index} label={region} value={region} />;
    } else {
      return null;
    }
  });

  return (
    <View style={styles.homeViewStyle}>
      {/* Picker rendered only if no game is started */}
      {!startGame && !startEndlessQuiz && (
        <View>
          <View style={styles.practiceView}>
            <Text style={styles.titleStyle}>PRACTICE</Text>
            <Text style={styles.fontStyle}>Practice your flags knowledge with this easy game. 25 questions for Worldwide type, 15 questions for any selected continent.</Text>
            <View style={styles.pickerContainer}>
              <Picker
                ref={pickerRef}
                selectedValue={selectedRegion}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedRegion(itemValue)
                }>
                <Picker.Item label="Choose a continent" value="" />
                <Picker.Item label="Worldwide" value="Worldwide" />
                {pickerItems}
              </Picker>
            </View>
            <Pressable
              onPress={handleStartGame}
              disabled={startGame || selectedRegion === ''}
              style={(startGame || selectedRegion === ''
                ? styles.pressableDisabledStyle
                : styles.pressableStyle)}
            >
              <Text style={styles.titleStyle}><Ionicons name="play" size={24} color="black" /> Start Guessing</Text>
            </Pressable>
          </View>
          <View style={styles.practiceView}>
            <Text style={styles.titleStyle}>ENDLESS CHALLENGE</Text>
            <Text style={styles.fontStyle}>Challenge yourself in this game. Questions keep coming as long as you guess them correctly and rack up points! Scores can be featured in the global leaderboards.</Text>
            <Pressable title="Start Endless Quiz" onPress={handleStartEndlessQuiz} style={styles.pressableStyle}>
              <Text style={styles.titleStyle}><Ionicons name="play" size={24} color="black" /> Start Endless Quiz</Text>
            </Pressable>
          </View>
        </View>
      )}
      {/* Button disabled if no region is selected */}
      {startGame && (
        <View>
          <GuessTheFlagGame countries={countriesList} selectedRegion={selectedRegion} />
          {/* Display quit button if game is in progress */}
          <Button title="Quit" onPress={handleQuitGame} />
        </View>
      )}
      {startEndlessQuiz && (
        <View>
          <EndlessQuizChallenge countries={countriesList} />
          {/* Display quit button if game is in progress */}
          <Button title="Quit" onPress={handleQuitEndlessQuiz} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fontStyle: {
    fontFamily: 'PlaypenSans',
    fontSize: 20,
    color: 'black'
  },
  homeViewStyle: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FEDD6E'
  },
  practiceView: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    borderWidth: 3,
    borderColor: '#3498db',
    borderRadius: 15,
    margin: 10,
    padding: 10,
  },
  pickerContainer: {
    width: '90%',
    marginTop: 10,
    borderColor: '#FF6F61',
    borderWidth: 1,
    borderRadius: 15
  },
  titleStyle: {
    fontFamily: 'PlaypenSansBold',
    fontSize: 20,
    color: 'black'
  },
  pressableStyle: {
    backgroundColor: '#FF6F61',
    padding: 10,
    margin: 10,
    borderRadius: 15,
    borderColor: 'black',
    borderWidth: 3
  },
  pressableDisabledStyle: {
    backgroundColor: '#BBB5B5',
    padding: 10,
    margin: 10,
    borderRadius: 15,
    borderColor: 'black',
    borderWidth: 3
  }
});
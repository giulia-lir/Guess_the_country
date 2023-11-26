import React from 'react';
import { useState, useEffect } from 'react';
import { Alert, Image, View, ScrollView, StyleSheet, Text, Button } from 'react-native';
import * as SQLite from 'expo-sqlite';
import GuessTheFlagGame from './game';

const db = SQLite.openDatabase('countriesdb.db');
const API_URL = 'https://restcountries.com/v2/all';

export default function Home() {

  const [countriesList, setCountriesList] = useState([]);
  const [startGame, setStartGame] = useState(false);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('create table if not exists countries (id integer primary key not null, name text, flag text, region text);');
    }, () => console.error("Error when creating DB"), );
    
    console.log('hi im elfo')
    db.transaction(tx => {
      tx.executeSql('select * from countries', [], (_, { rows }) => {
        console.log(rows._array.length)
        if (rows._array.length > 0) {
          const countriesFromDB = Array.from(rows._array).map(row => ({
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
    }, () => console.error("Error when loading from DB"), )
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
  
  const handleStartGame = () => {
    setStartGame(true);
  };

  /*
  <ScrollView>
    <Text style={styles.fontStyle}>This is the Home page</Text>
    {countriesList.map(savedCountry => (
        <View key={savedCountry.name}>
            <Text>{`Name: ${savedCountry.name}`}</Text>
            <Text>{`Flag:`}</Text>
            <Image source={{uri: savedCountry.flag}} style={{ width: 100, height: 70 }} />
            <Text>{`Region: ${savedCountry.region}`}</Text>
            <Text>------</Text>
        </View>
    ))}
  </ScrollView>
  */
  
  return (
    <View>
      {startGame ? (
        <GuessTheFlagGame countries={countriesList} selectedRegion="Worldwide" />
      ) : (
        <Button title="Start Guess The Flag Game" onPress={handleStartGame} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    fontStyle: {
      fontFamily: 'PlaypenSans',
      fontSize: 20,
      color: 'black'
    }
  });
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StyleSheet, Alert } from 'react-native';
import Home from './components/home';
import Scoreboards from './components/scoreboards';
import React, { useCallback, useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { FontAwesome5 } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('countriesdb.db');
const API_URL = 'https://restcountries.com/v2/all';
const Tab = createMaterialTopTabNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    'PlaypenSansBold': require('./assets/fonts/PlaypenSans-ExtraBold.ttf'),
    'PlaypenSans': require('./assets/fonts/PlaypenSans-Thin.ttf'),
  });

  const [appIsReady, setAppIsReady] = useState(false);
  const [countriesList, setCountriesList] = useState([]);

  useEffect(() => {
    async function prepare() {
      db.transaction(tx => {
        tx.executeSql('create table if not exists countries (id integer primary key not null, name text, flag text, region text);');
      }, () => console.error("Error when creating countries table"),);

      db.transaction(tx => {
        tx.executeSql('create table if not exists endless_scores (id integer primary key not null, endless_score integer);');
      }, () => console.error("Error when creating endless_score table"),);

      db.transaction(tx => {
        tx.executeSql('create table if not exists player_info (id integer primary key not null, nickname text);');
      }, () => console.error("Error when creating player_info table"),);

      db.transaction(tx => {
        tx.executeSql('select * from countries', [], (_, { rows }) => {
          if (rows._array.length > 0) {
            const countriesFromDB = Array.from(rows._array).map(row => ({
              id: row.id,
              name: row.name,
              flag: row.flag,
              region: row.region,
            }));

            setCountriesList(countriesFromDB);
            setAppIsReady(true);

          } else {
            console.log('No records found in the database.');
            fetchCountries();
            setAppIsReady(true);
          }
        });
      }, () => console.error("Error when loading from DB"),)
    }
    prepare();
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

  const onLayoutRootView = useCallback(async () => {
    console.log("onLayoutRootView triggered", fontsLoaded, appIsReady);
    if (fontsLoaded && appIsReady) {
      console.log("Hiding splash screen");
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, appIsReady]);

  if (!fontsLoaded || !appIsReady) {
    return null;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{
        tabBarStyle: styles.navigatorTabsStyle,
        tabBarLabelStyle: styles.tabFontStyle,
      }}
        onLayout={onLayoutRootView}
      >
        <Tab.Screen
          name="Games"
          options={{
            tabBarIcon: () => (
              <FontAwesome5 name="font-awesome-flag" size={23} color="#3498db" />
            ),
          }}
        >
          {() => <Home countriesList={countriesList} />}
        </Tab.Screen>
        <Tab.Screen
          name="Scoreboards"
          options={{
            tabBarIcon: () => (
              <FontAwesome name="trophy" size={25} color="#3498db" />
            ),
          }}
        >
          {() => <Scoreboards />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    color: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigatorTabsStyle: {
    marginTop: 50,
    backgroundColor: '#ecf0f1',
  },
  tabFontStyle: {
    fontFamily: 'PlaypenSansBold',
    fontSize: 12,
    color: '#3498db'
  }
});

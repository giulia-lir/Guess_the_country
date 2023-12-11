import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GuessTheFlagGame from './game';
import EndlessQuizChallenge from './endless_quiz';

export default function Home({countriesList}) {

  const [startGame, setStartGame] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState();
  const uniqueRegions = new Set();
  const [startEndlessQuiz, setStartEndlessQuiz] = useState(false);

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
    <LinearGradient
      colors={['#FF8C00', '#FFD700', '#FFE4C4', '#D2B48C', '#87CEEB', '#556B2F']}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={styles.homeViewStyle}>
      {/* Picker rendered only if no game is started */}
      {!startGame && !startEndlessQuiz && (
        <View>
          <View style={styles.gameSelectionView}>
            <Text style={styles.titleStyle}>TRAINING ZONE</Text>
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
          <View style={styles.gameSelectionView}>
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
        <ScrollView>
          <GuessTheFlagGame countries={countriesList} selectedRegion={selectedRegion} />
          {/* Display quit button if game is in progress */}
          <Pressable onPress={handleQuitGame} style={styles.quitPressableStyle}>
            <FontAwesome5 name="stop" size={24} color="red" /><Text style={styles.quitFontStyle}>QUIT</Text>
          </Pressable>
        </ScrollView>
      )}
      {startEndlessQuiz && (
        <ScrollView>
          <EndlessQuizChallenge countries={countriesList} />
          {/* Display quit button if game is in progress */}
          <Pressable onPress={handleQuitEndlessQuiz} style={styles.quitPressableStyle}>
            <FontAwesome5 name="stop" size={24} color="red" /><Text style={styles.quitFontStyle}>QUIT</Text>
          </Pressable>
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fontStyle: {
    fontFamily: 'PlaypenSans',
    fontSize: 20,
    color: 'black'
  },
  quitFontStyle: {
    fontSize: 10,
  },
  homeViewStyle: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FEDD6E'
  },
  gameSelectionView: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    borderTopWidth: 1,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderLeftWidth: 1,
    borderColor: 'grey',
    borderRadius: 15,
    margin: 10,
    padding: 10,
  },
  pickerContainer: {
    width: '90%',
    marginTop: 10,
    borderColor: '#3498db',
    borderWidth: 1,
    borderRadius: 15
  },
  titleStyle: {
    fontFamily: 'PlaypenSansBold',
    fontSize: 20,
    color: 'black'
  },
  pressableStyle: {
    backgroundColor: '#ecf0f1',
    padding: 10,
    margin: 10,
    borderRadius: 15,
    borderColor: '#3498db',
    borderTopWidth: 1,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderLeftWidth: 1,
  },
  pressableDisabledStyle: {
    backgroundColor: '#BBB5B5',
    padding: 10,
    margin: 10,
    borderRadius: 15,
    borderColor: 'black',
    borderTopWidth: 1,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderLeftWidth: 1,
  },
  quitPressableStyle: {
    backgroundColor: '#ecf0f1',
    padding: 10,
    width: 70,
    height: 'auto',
    marginTop: 20,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#9B5600',
    borderTopWidth: 1,
    borderRightWidth: 5,
    borderLeftWidth: 1,
    borderBottomWidth: 5,
    bottom: 0,
    alignSelf: 'center',
  }
});
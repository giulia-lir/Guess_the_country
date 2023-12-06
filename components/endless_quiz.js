import React, { useState, useEffect, useRef } from 'react';
import * as SQLite from 'expo-sqlite';
import { Animated, ImageBackground, View, Text, Pressable, Image, StyleSheet } from 'react-native';

const db = SQLite.openDatabase('countriesdb.db');

export default EndlessQuizChallenge = ({ countries }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [endlessScore, setEndlessScore] = useState(0);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [disableOptions, setDisableOptions] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [buttonColor, setButtonColor] = useState(['#ecf0f1', '#ecf0f1', '#ecf0f1', '#ecf0f1']);
  const slideAnim = useRef(new Animated.Value(500)).current;

  const restartEndlessChallenge = () => {
    slideAnim.setValue(500);
    setButtonColor(['#ecf0f1', '#ecf0f1', '#ecf0f1', '#ecf0f1'])
    setEndlessScore(0);
    setCurrentQuestion(0);
    setGameOver(false);
    startRound();
  }

  const startRound = () => {
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const options = getRandomOptions(countries, randomCountry);
    setCorrectAnswer(randomCountry.name);
    setCurrentOptions(options);
    optionsAnimationEffect(options);
    setDisableOptions(false);
  }

  const optionsAnimationEffect = (options) => {
    if (options.length > 0) {
      const animations = options.map((_, index) => {
        return Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          delay: index * 100,
          useNativeDriver: false,
        });
      });
      Animated.sequence(animations).start();
    }
  }

  const getRandomOptions = (countries, correctCountry) => {
    const options = [correctCountry.name.toUpperCase()];

    while (options.length < 4) {

      const randomCountry = countries[Math.floor(Math.random() * countries.length)];

      // Avoid false incorrect answers for Norway and Svalbard, which share same flag
      const isCorrectOrExcluded =
        randomCountry.name === correctCountry.name ||
        (correctCountry.name === 'Norway' && randomCountry.name === 'Svalbard and Jan Mayen') ||
        (correctCountry.name === 'Svalbard and Jan Mayen' && randomCountry.name === 'Norway');

      if (!options.includes(randomCountry.name.toUpperCase()) && !isCorrectOrExcluded) {
        options.push(randomCountry.name.toUpperCase());
      }
    }

    // Shuffle the options
    return options.sort(() => Math.random() - 0.5);
  };

  const handleOptionPress = (selectedCountry, index) => {
    const newButtonColor = [...buttonColor];

    if (selectedCountry === correctAnswer.toUpperCase()) {
      setEndlessScore(endlessScore + 1);
      newButtonColor[index] = '#09B400';
      setDisableOptions(true);
      setTimeout(() => {
        slideAnim.setValue(500);
        setCurrentQuestion(currentQuestion + 1);
        setButtonColor(['#ecf0f1', '#ecf0f1', '#ecf0f1', '#ecf0f1'])
        startRound();
      }, 500);
    } else {
      newButtonColor[index] = '#D90600';
      setDisableOptions(true);
      setTimeout(() => { setGameOver(true) }, 500)
    }
    setButtonColor(newButtonColor);
  };

  const saveScore = () => {
    db.transaction(tx => {
      tx.executeSql('insert into endless_scores (endless_score) values (?);', [endlessScore]);
    }, (_, error) => {
      console.error("Error during insert:", error);
    },    )
  }

  useEffect(() => {
    startRound();
  }, [])

  if (gameOver) {

    // saveScore function
    saveScore();

    return (
      <View>
        <Text>Game Over!</Text>
        <Text>Your Score: {endlessScore}</Text>
        <Pressable title="Replay" onPress={() => restartEndlessChallenge()} style={styles.replayButtonStyle}>
          <Text>Replay</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.viewStyle}>
      <Text style={[styles.fontStyle, styles.headerSize]} >Question {currentQuestion + 1}</Text>
      <Text style={[styles.fontStyle, styles.headerSize]} >Score: {endlessScore}</Text>
      <ImageBackground resizeMode="cover" style={styles.shadowImage}>
        <Image source={{ uri: countries.find(country => country.name === correctAnswer)?.flag }} style={styles.flagStyle} />
      </ImageBackground>
      {currentOptions.map((option, index) => (
        <Animated.View
          key={option}
          style={{
            ...styles.optionsStyle,
            ...styles.optionSize,
            backgroundColor: buttonColor[index],
            transform: [{ translateY: slideAnim }],
          }}>
          <Pressable onPress={() => handleOptionPress(option, index)} disabled={disableOptions}>
            <Text title={option} style={{ ...styles.fontStyle, textAlign: 'center' }}>
              {option}
            </Text>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

/* To avoid so much redundant code, Babel and Metro could be configured to read css files and traslate them to JS, so not to have repetitive styling as suggested at
Link: https://sparkbox.com/foundry/style_react_native_apps_with_css_syntax_and_classes_using_babel_and_metro
*/

const styles = StyleSheet.create({
  viewStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontStyle: {
    fontFamily: 'PlaypenSansBold',
    color: 'black',
  },
  headerSize: {
    fontSize: 20
  },
  optionSize: {
    fontSize: 15,
  },
  shadowImage: {
    width: '80%',
    height: 200,
    zIndex: 1,
    backgroundColor: '#BE9A22',
    borderRadius: 15,
    position: 'relative',
    margin: 10
  },
  flagStyle: {
    width: '99%',
    height: 200,
    objectFit: 'contain', // Render image maintaining aspect ratio for flags
    borderWidth: 3,
    borderColor: 'black',
    borderRadius: 15,
    zIndex: 2,
    marginLeft: -10,
    marginTop: -10
  },
  optionsStyle: {
    width: '70%',
    margin: 15,
    padding: 10,
    borderRadius: 15,
    borderColor: '#3498db',
    borderWidth: 3,
  },
  replayButtonStyle: {
    backgroundColor: '#3498db',
    borderRadius: 15,
    padding: 10,
    margin: 20,
    width: '30%',

  },
});
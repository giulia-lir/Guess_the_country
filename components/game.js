import React, { useState, useEffect, useRef } from 'react';
import { Animated, ImageBackground, View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default GuessTheFlagGame = ({ countries, selectedRegion }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [disableOptions, setDisableOptions] = useState(false);
  const [buttonColor, setButtonColor] = useState(['#ecf0f1', '#ecf0f1', '#ecf0f1', '#ecf0f1']);
  const slideAnim = useRef(new Animated.Value(500)).current;

  const restartPracticeGame = () => {
    slideAnim.setValue(500);
    setButtonColor(['#ecf0f1', '#ecf0f1', '#ecf0f1', '#ecf0f1'])
    setScore(0);
    setCurrentQuestion(0);
    startRound();
  }

  const startRound = () => {
    const filteredCountries = countries.filter(country => {
      if (selectedRegion === 'Worldwide') {
        return true; // Include all countries when 'Worldwide' is selected
      } else {
        return country.region === selectedRegion;
      }
    });

    const randomCountry = filteredCountries[Math.floor(Math.random() * filteredCountries.length)]; // Need to check and avoid duplicates
    const options = getRandomOptions(filteredCountries, randomCountry);

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
      setScore(score + 1);
      newButtonColor[index] = '#09B400';
      setDisableOptions(true);
    } else {
      newButtonColor[index] = '#D90600';
      setDisableOptions(true);
    }

    setButtonColor(newButtonColor);

    setTimeout(() => {
      slideAnim.setValue(500);
      setCurrentQuestion(currentQuestion + 1);
      setButtonColor(['#ecf0f1', '#ecf0f1', '#ecf0f1', '#ecf0f1'])
      startRound();
    }, 500);
  };

  useEffect(() => {
    startRound();
  }, [])

  // Fixed 25 flag questions for the Worldwide mode
  if (selectedRegion == 'Worldwide' && currentQuestion >= 25) {
    return (
      <View style={styles.gameOverStyle}>
        <Text style={[styles.fontStyle, styles.headerSize]}>Game Over!</Text>
        <Text style={[styles.fontStyle, styles.headerSize]}>Your Score: {score} / 25</Text>
        <Pressable title="Replay" onPress={() => restartPracticeGame()} style={styles.replayButtonStyle}>
          <MaterialIcons name="replay" size={24} color="black" />
          <Text style={styles.replayFontStyle}>REPLAY</Text>
        </Pressable>
      </View>
    );
  }

  // Fixed 15 flag questions for a selected continent
  if (selectedRegion != 'Worldwide' && currentQuestion >= 15) {
    return (
      <View style={styles.gameOverStyle}>
        <Text style={[styles.fontStyle, styles.headerSize]}>Game Over!</Text>
        <Text style={[styles.fontStyle, styles.headerSize]}>Your Score: {score} / 15</Text>
        <Pressable title="Replay" onPress={() => restartPracticeGame()} style={styles.replayButtonStyle}>
          <MaterialIcons name="replay" size={24} color="black" />
          <Text style={styles.replayFontStyle}>REPLAY</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.viewStyle}>
      <Text style={[styles.fontStyle, styles.headerSize]} >Question {currentQuestion + 1}</Text>
      <Text style={[styles.fontStyle, styles.headerSize]} >Score: {score}</Text>
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
};

// Make it fabulous
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
  replayFontStyle: {
    fontSize: 10,
  },
  gameOverStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(190, 154, 34, 0.6)',
    padding: 20,
    marginTop: 50,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 15,
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
    margin: 10,
    paddingRight: 5,
  },
  flagStyle: {
    width: '99%',
    height: 200,
    objectFit: 'contain', // Render image maintaining aspect ratio for flags
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 15,
    zIndex: 2,
    marginTop: -8,
  },
  optionsStyle: {
    width: '70%',
    margin: 15,
    padding: 10,
    borderRadius: 15,
    borderColor: '#BE9A22',
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  replayButtonStyle: {
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
  },
});
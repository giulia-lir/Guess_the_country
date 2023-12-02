import React, { useState, useEffect } from 'react';
import { ImageBackground, View, Text, Pressable, Image, StyleSheet } from 'react-native';

export default GuessTheFlagGame = ({ countries, selectedRegion }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [replayGame, setReplayGame] = useState(false);
  const [buttonColor, setButtonColor] = useState(['#CFCA89', '#33CCCC', '#CFCA89', '#33CCCC']);

  // Render the question (flag) with answers (4 buttons, 1 correct option)
  useEffect(() => {
    if (replayGame) {
      setScore(0);
      setCurrentQuestion(0);
      setReplayGame(false);
    } else {
      // Filter countries to be adjusted by region, if worldwide is selected all countries count
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
    
    // Add styling, question transition animation
    }
  }, [currentQuestion, selectedRegion, replayGame]);

  const getRandomOptions = (countries, correctCountry) => {
    const options = [correctCountry.name.toUpperCase()];

    while (options.length < 4) {
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      if (!options.includes(randomCountry.name)) {
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
    } else {
      newButtonColor[index] = '#D90600';
    }

    setButtonColor(newButtonColor);

    setTimeout(() => {
      setCurrentQuestion(currentQuestion + 1);
      setButtonColor(['#CFCA89', '#33CCCC', '#CFCA89', '#33CCCC'])
    }, 500);
  };

  // Fixed 25 flag questions for the Worldwide mode
  if (selectedRegion == 'Worldwide' && currentQuestion >= 25) {
    return (
      <View>
        <Text>Game Over!</Text>
        <Text>Your Score: {score}</Text>
        <Pressable title="Replay" onPress={() => setReplayGame(true)} />
      </View>
    );
  }

  // Fixed 15 flag questions for a selected continent
  if (selectedRegion != 'Worldwide' && currentQuestion >= 15) {
    return (
      <View>
        <Text>Game Over!</Text>
        <Text>Your Score: {score}</Text>
        <Pressable title="Replay" onPress={() => setReplayGame(true)} />
      </View>
    );
  }

  return (
    <View style={styles.viewStyle}>
      <Text style={[styles.fontStyle, styles.headerSize]} >Question {currentQuestion + 1}</Text>
        <ImageBackground  resizeMode="cover" style={styles.shadowImage}>
          <Image source={{ uri: countries.find(country => country.name === correctAnswer)?.flag }} style={styles.flagStyle} />
        </ImageBackground>
      {currentOptions.map((option, index) => (
        <Pressable onPress={() => handleOptionPress(option, index)} style={{
          ...styles.optionsStyle,
          ...styles.optionSize,
          backgroundColor: buttonColor[index],
        }}>
          <Text key={option} title={option} style={{...styles.fontStyle, textAlign: 'center'}}>{option}</Text>
        </Pressable>
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
  optionSize: {
    fontSize: 15,
  },
  shadowImage: {
    width: '80%',
    height: 200,
    zIndex: 1,
    backgroundColor: 'black',
    borderRadius: 15,
    position: 'relative',
    margin: 10
  },
  flagStyle: {
    width: '99%',
    height: 200,
    objectFit: 'contain', // Render image maintaining aspect ratio for flags
    borderWidth: 3,
    borderColor: 'grey',
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
    borderColor: 'black',
    borderWidth: 3,
  },
});
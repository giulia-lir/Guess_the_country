import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image } from 'react-native';

export default GuessTheFlagGame = ({ countries, selectedRegion }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [replayGame, setReplayGame] = useState(false);

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
    const options = [correctCountry.name];

    while (options.length < 4) {
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      if (!options.includes(randomCountry.name)) {
        options.push(randomCountry.name);
      }
    }

    // Shuffle the options
    return options.sort(() => Math.random() - 0.5);
  };

  const handleOptionPress = selectedCountry => {

    if (selectedCountry === correctAnswer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      setCurrentQuestion(currentQuestion + 1);
    }, 500);
    // add green color for correct answer (always show), red color for incorrect answer and delay a couple seconds transition to next question
    //setCurrentQuestion(currentQuestion + 1);
  };

  if (currentQuestion >= 15) {
    return (
      <View>
        <Text>Game Over!</Text>
        <Text>Your Score: {score}</Text>
        <Button title="Replay" onPress={() => setReplayGame(true)} />
      </View>
    );
  }

  return (
    <View>
      <Text>Question {currentQuestion + 1}</Text>
      <Image source={{ uri: countries.find(country => country.name === correctAnswer)?.flag }} style={{ width: '90%', aspectRatio: 5 / 3 }} />
      {currentOptions.map(option => (
        <Button key={option} title={option} onPress={() => handleOptionPress(option)} />
      ))}
    </View>
  );
};

// Make it fabulous

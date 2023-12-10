# Guess_the_country
Final Project for Mobile Programming course. The application is developed using React Native + Expo.
The app uses the countries API service (https://restcountries.com/v2/all) to initially fetch all countries information related to country name, flag and continent. The list of countries is then saved locally with SQLite and the play sessions are based on that afterwards to avoid repetitive API calling.
There are two game modes:
1. Practice mode:
The practice mode requires the player to select which continent to practice on, based on the choice the app fetches a numbered set of questions which the player has to answer.
If the player selected Worldwide type of practice the set of questions is up to 25.
If the player selected any other continent, the set of questions is up to 15.
Answering right or wrong is recorded while the game proceeds and the total score is shown and the end of the session.
2. Endless quiz challenge:
This type of game will have questions continuoasly created and provided to the player as long as the player answers correctly. A score point is rewarded each time and recorded. The game ends if the player answers wrong.
The top 10 bests personal scores in this type of game are recorded and shown in the scoreboard section, while the highest score achieved can be registered in the global leaderboard if the player provides email and password authentication.

## Components and libraries:
- Material top tab navigation
- Expo font + Google fonts
- SQLite DB for local storing of player data and countries list
- React Native Picker component
- CSS object-fit property
- React Animated
- React UseFocusEffect for re-render
- Expo Linear Gradient
- Firebase realtime DB
- Firebase email/password authentication
- React Native Persistence in AsyncStorage for session persistence

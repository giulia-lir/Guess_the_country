import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Home from './components/home';
import Scoreboards from './components/scoreboards';
import { useCallback } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { FontAwesome5 } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

const Tab = createMaterialTopTabNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    'PlaypenSansBold': require('./assets/fonts/PlaypenSans-ExtraBold.ttf'),
    'PlaypenSans': require('./assets/fonts/PlaypenSans-Thin.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{
          tabBarStyle: styles.navigatorTabsStyle, // overall style
          // tabStyle: styles.tabStyle,  specific tab style
          tabBarLabelStyle: styles.tabFontStyle,
        }} onLayout={onLayoutRootView}>
        <Tab.Screen 
          name="Games" 
          component={Home} 
          options={{
              tabBarIcon: () => (
                <FontAwesome5 name="font-awesome-flag" size={23} color="#3498db" />
              ),
            }}
        />
        <Tab.Screen 
          name="Scoreboards" 
          component={Scoreboards} 
          options={{
            tabBarIcon: () => (
              <FontAwesome name="trophy" size={25} color="#3498db" />
            ),
          }}
        />
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

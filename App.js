import {NavigationContainer} from '@react-navigation/native';

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import Home from './components/screens/Home';
import InCall from './components/screens/InCall';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Invite from './components/screens/Invite';
import Join from './components/screens/Join';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="InCall" component={InCall} />
        <Stack.Screen name="Join" component={Join} />
        <Stack.Screen name="Invite" component={Invite} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from 'react-native-vector-icons';
import RegistrationScreen from './RegistrationScreen';
import CameraScreen from './CameraScreen';
import WebScreen from './WebScreen';
import LoginScreen from './LoginScreen';
import ManualScreen from './ManualScreen';
import ResultsScreen from './ResultsScreen';
import RacesScreen from './RacesScreen';
import RaceDetailScreen from './RaceDetailScreen';
import styles from './styles'; 
import pnNumbers from './pnNumbers';
import { AuthProvider } from './AuthProvider';
import CreateRaceScreen from './CreateRaceScreen';
import {LogBox} from 'react-native';
import ResetPasswordScreen from './ResetPasswordScreen';
import instruction from './Instructions.js'
import LoadingScreen from './LoadingScreen.js'
import OverviewScreen from './OverviewScreen.js'


LogBox.ignoreAllLogs();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack for all the popup tabs
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name=" "
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Manual" component={ManualScreen} />
          <Stack.Screen name="RaceDetail" component={RaceDetailScreen} />
          <Stack.Screen name="Races" component={RacesScreen}/>
          <Stack.Screen name="CreateRace" component={CreateRaceScreen}/>
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen}/>
          <Stack.Screen name="LoadingScreen" component={LoadingScreen}/>
          <Stack.Screen name="OverviewScreen" component={OverviewScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

// Navigator for all tabs that are permanently on the screen
function TabNavigator({ loggedIn }) {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Registration"
        component={RegistrationScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Information"
        component={WebScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="ship" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="camera" color={color} size={size} />
          ),
        }}
      />      
      <Tab.Screen
        name="Results"
        component={ResultsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="address-book" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Instructions"
        component={instruction}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="question" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

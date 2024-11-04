// Mocking React Native modules
jest.mock('react-native/Libraries/Utilities/Platform', () => {
  const Platform = {
    OS: 'ios',
    select: () => null // You can add more methods as needed
  };
  return Platform;
});

// Mocking Expo modules if you're using Expo
jest.mock('expo', () => ({
  ...jest.requireActual('expo'),
  Platform: {
    OS: 'ios',
    select: () => null
  }
}));

// Import necessary modules
import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import App from './App.js'


const Stack = createStackNavigator();


const navigationContext = {
  value: {
    navigation: {
      navigate: jest.fn(),
      goBack: jest.fn(),
    },
  },
};

const renderWithNavigation = (component) => {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        {component}
      </Stack.Navigator>
    </NavigationContainer>,
    { wrapper: navigationContext }
  );
};


describe('App Component', () => {
  test('renders without crashing', () => {
    renderWithNavigation(<App />);
  });

});

describe('TabNavigator Function', () => {
  test('renders all tab screens', () => {
    const { getByText } = renderWithNavigation(<App />);
    
    expect(getByText('Registration')).toBeTruthy();
    expect(getByText('Information')).toBeTruthy();
    expect(getByText('Camera')).toBeTruthy();
    expect(getByText('Results')).toBeTruthy();
    expect(getByText('Instructions')).toBeTruthy();
  });

});


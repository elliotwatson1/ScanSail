import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import styles from './styles';

// simple page just so a loading screen works inbetween pages
const LoadingScreen = () => {
  return (
    <View style={styles.loadcont}>
      <Text style={styles.loadtext}>Loading...</Text>
      <ActivityIndicator size="large" color="white" />
    </View>
  );
};



export default LoadingScreen;

// An attempt of making a page for specifically creating races
// but left as a dead end as it seemed inefficient and useless

import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { openDatabase } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';

const db = openDatabase('RaceResults.db');

const CreateRaceScreen = () => {
  const [raceName, setRaceName] = useState('');
  const navigation = useNavigation();

  const createRace = () => {
    if (!raceName) {
      Alert.alert('Error', 'Please enter a race name.');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO race_results (race_name) VALUES (?)',
        [raceName],
        (_, success) => {
          console.log('Race created successfully.');
          navigation.navigate('RaceDetail', {raceName, selectedResults: []});
        },
        (_, error) => {
          console.error('Error creating race:', error);
        }
      );
    });
  };

  return (
    <View>
      <TextInput
        placeholder="Enter Race Name"
        value={raceName}
        onChangeText={setRaceName}
      />
      <Button title="Create Race" onPress={createRace} />
    </View>
  );
};

export default CreateRaceScreen;
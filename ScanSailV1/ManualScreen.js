import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, KeyboardAvoidingView, TouchableOpacity, Platform, Alert } from 'react-native';
import { openDatabase } from 'expo-sqlite';
import SearchableDropdown from 'react-native-searchable-dropdown'; 
import styles from './styles'; 
import { useAuth } from './AuthProvider'; 
import { pnNumbers } from './pnNumbers'; 

const db = openDatabase('RaceResults.db');

var upperCaseTime;

// functions for gettinf the timings correct
// and making sure the correct time is put in with
// regards to the PN number
function parseTime(time) {
  if(time){
    var upperCaseTime = time.toUpperCase();
    if (upperCaseTime === 'DNF') {
      return 'DNF';
    }
    else if (upperCaseTime === 'DNS') {
      return 'DNS';
    }
  }
  else{
    return;
  }
    

  const [minutes, seconds] = upperCaseTime.split(':').map((part) => parseInt(part, 10));
  if (isNaN(minutes) || isNaN(seconds)) {
    return 0;
  }
  return minutes * 60 + seconds;
}


function calculateCorrectedTime(time, laps, PN) {
  if (time === 'DNF' || time === 'DNS' || laps <= 0 || PN <= 0) {
    return 'DNF';
  }
  if (time <= 0) {
    return 'Invalid';
  }
  return ((time * laps * 1000) / (PN * laps)).toFixed(2);
}

function secondsToMinutes(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

const initialiseDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS race_results (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, full_name TEXT, sail_no TEXT, race_class TEXT, race_time TEXT, laps INTEGER, corrected_time REAL, pn REAL, race_name TEXT);'
    );
  });
};

function ManualScreen({ navigation, route }) {
  useEffect(() => {
    initialiseDatabase();
  }, []);

  const { detectedText, fullName: initialFullName, sailNo: initialSailNo, raceClass: initialRaceClass, raceTime: initialRaceTime, laps: initialLaps } = route.params;


  const [fullName, setFullName] = useState(initialFullName);
  const [sailNo, setSailNo] = useState(initialSailNo);
  const [raceClass, setRaceClass] = useState(initialRaceClass);
  const [raceTime, setRaceTime] = useState(initialRaceTime);
  const [laps, setLaps] = useState(initialLaps);
  const [selectedItem, setSelectedItem] = useState(null);
  const [raceClassInput, setRaceClassInput] = useState('');
  const [isDNFButtonVisible, setIsDNFButtonVisible] = useState(false);
  const [isDNSButtonVisible, setIsDNSButtonVisible] = useState(true); // Set DNS button visible by default
  const { loggedInUserId } = useAuth();

  const resetInputs = () => {
    setFullName(initialFullName);
    setSailNo(initialSailNo);
    setRaceClass(initialRaceClass);
    setRaceTime(initialRaceTime);
    setLaps(initialLaps);
  };

  const resetInputs2 = () => {
    setFullName('');
    setSailNo('');
    setRaceClass('')
    setRaceTime('');
    setLaps('');
  };

  useEffect(() => {
    if (selectedItem) {
      setRaceClassInput(selectedItem.name);
    }
  }, [selectedItem]);

  useEffect(() => {
    setIsDNFButtonVisible(true);
  }, []);

  // if(isNaN(detectedText)){
  //   Alert.alert("No Text Detected")
  // }

  const deleteResult = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM race_results WHERE id = ?',
        [id],
        (_, success) => {
          console.log('Result deleted successfully:', success);
          loadResults();
        },
        (_, error) => console.error('Error deleting result:', error)
      );
    });
  };

  const saveResult = () => {
    const parsedRaceTime = parseTime(raceTime);
    const selectedPN = pnNumbers[raceClass];
    const correctedTime = calculateCorrectedTime(parsedRaceTime, laps, selectedPN);

    if(parsedRaceTime == 'DNF' || parsedRaceTime == 'DNS'){
      const correctedTime = parsedRaceTime;
    }else{
      const selectedPN = pnNumbers[raceClass];
      const correctedTime = calculateCorrectedTime(parsedRaceTime, laps, selectedPN);

      if (isNaN(selectedPN) || correctedTime === 'Invalid') {
        Alert.alert('Invalid Input', 'Please ensure all fields are filled in correctly.');
        resetInputs2();
        return;
      }
    }
  
    // transaction for saving the result into the database
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO race_results (user_id, full_name, sail_no, race_class, race_time, laps, corrected_time, pn) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [loggedInUserId, fullName, sailNo, raceClass, raceTime, laps, correctedTime, selectedPN],
        (_, result) => {
          console.log('Insert result:', result);
          const { insertId } = result;
          tx.executeSql(
            'SELECT * FROM race_results WHERE id = ?',
            [insertId],
            (_, queryResult) => {
              console.log('Query result:', queryResult);
              if (queryResult?.rows?._array) {
                const newResult = queryResult.rows._array[0];
                navigation.navigate('Results', { newResult: newResult });
                resetInputs2();
              } else {
                console.error('No result found for the given ID:', insertId);
                resetInputs2();
              }
            },
            (_, error) => {
              console.error('Query error:', error);
              Alert.alert('Error', 'Failed to fetch the new result.')
            }
          );
        },
        (_, error) => {
          console.error('Insert error:', error);
          Alert.alert('Error', 'Failed to save result.')
        }
      );
    });
  };

  // making DNF and DNS perform correctly
  const handleDNFButtonPress = () => {
    setRaceTime('DNF');
  };

  const handleDNSButtonPress = () => {
    setRaceTime('DNS');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Full Name" onChangeText={setFullName} value={fullName} />
        <TextInput style={styles.input} placeholder="Sail Number" onChangeText={setSailNo} value={sailNo} keyboardType='numeric'/>
        <TextInput 
          style={styles.input} 
          placeholder="Boat Class" 
          onChangeText={text => setRaceClass(text.toUpperCase())} 
          value={raceClass} 
        />
        <TextInput
            style={styles.input}
            placeholder="Time in MM:SS"
            onChangeText={text => setRaceTime(text)}
            value={raceTime}
            
          />
          <View style={{ flexDirection: 'row' }}>
              {isDNFButtonVisible && (
                  <TouchableOpacity style={styles.dnfButton} onPress={handleDNFButtonPress}>
                      <Text style={styles.dnfButtonText}>DNF</Text>
                  </TouchableOpacity>
              )}
              {isDNSButtonVisible && (
                  <TouchableOpacity style={styles.dnsButton} onPress={handleDNSButtonPress}>
                      <Text style={styles.dnfButtonText}>DNS</Text>
                  </TouchableOpacity>
              )}
          </View>

        <TextInput style={styles.input} placeholder="Laps" onChangeText={setLaps} value={laps} keyboardType="numeric" />
        <TouchableOpacity  onPress={saveResult} style={styles.sButton}>
          <Text style={styles.dnfButtonText}>Save Result</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export default ManualScreen;

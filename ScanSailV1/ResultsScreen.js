import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Button, Linking, Alert, KeyboardAvoidingView} from 'react-native';
import { openDatabase } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { parse } from 'papaparse';
import { useAuth } from './AuthProvider';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';



const db = openDatabase('RaceResults.db');

const initialiseDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS race_results (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, full_name TEXT, sail_no TEXT, race_class TEXT, race_time TEXT, laps INTEGER, corrected_time REAL, pn REAL, race_name TEXT);',
      [],
      (_, success) => {},
      (_, error) => {
        Alert.alert('Error', 'Failed to create table "race_results".');
      }
    );
  });
};


function parseTime(time) {
  const [minutes, seconds] = time.split(':').map((part) => parseInt(part, 10));
  if (isNaN(minutes) || isNaN(seconds)) {
    return 0;
  }
  return minutes * 60 + seconds;
}

function calculateCorrectedTime(time, laps, PN) {
  if (time <= 0 || laps <= 0 || PN <= 0) {
    return 'Invalid';
  }
  
  const correctedSeconds = (time * laps * 1000) / (PN * laps);
  const correctedMinutes = Math.floor(correctedSeconds / 60);
  const remainingSeconds = correctedSeconds % 60;

  const adjustedMinutes = correctedMinutes + Math.floor(remainingSeconds / 60);
  const adjustedSeconds = remainingSeconds % 60;

  return `${adjustedMinutes}:${adjustedSeconds < 10 ? '0' : ''}${adjustedSeconds}`;
}


function secondsToMinutes(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// function to show the saved results
function ResultsScreen({ route }) {
  initialiseDatabase();
  const navigation = useNavigation();


  const [allResults, setAllResults] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [raceName, setRaceName] = useState('');
  const { loggedInUserId } = useAuth();
  const { savedResults } = route.params || {};
  const [showAlert, setShowAlert] = useState(true);
  const [lapTimes, setLapTimes] = useState([]);

  useEffect(() => {
    if (showAlert && loggedInUserId) { 
        Alert.alert(
            `Welcome to your ScanSail.`,
            'All of your saved results will be visible in this page to you and only you. \nPlease bare in mind that all RACE RESULTS are public for all to see.\nAdding a result to a race will remove it from your results.',
            [{text: 'OK', onPress: () => console.log('OK pressed')}]
        );
        setShowAlert(false);
    }
}, [loggedInUserId, showAlert]);


  useEffect(() => {
    if (route.params?.newResult) {
      setAllResults((prevResults) => [...prevResults, route.params.newResult]);
    } else {
      loadResults();
    }
  }, [route.params?.newResult]); 

  useEffect(() => {
    loadResults();
  }, [loggedInUserId]);

  useEffect(() => {
    if (!loggedInUserId) {
      setAllResults([]);
      setSelectedResults([]);
      setRaceName('');
    } else {
      loadResults();
    }
  }, [loggedInUserId]);

  useEffect(() => {
    const avgLapTimes = calculateAverageLapTimes(allResults);
    setLapTimes(avgLapTimes);
  }, [allResults]);

  const calculateAverageLapTimes = (results) => {
    if (!results || results.length === 0) {
      return [];
    }
  
    const lapTimes = results.map((item) => {
      return Number(item.corrected_time / (60 * item.laps));
    });
  
    return lapTimes;
  };

  // to load the results from the database
  const loadResults = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM race_results WHERE user_id = ?',
        [loggedInUserId],
        (_, { rows }) => {
          setAllResults(rows._array || []);
        },
        (_, error) => {
          console.error('Error fetching results:', error);
          Alert.alert('Error', 'Failed to fetch results from the database.');
        }
      );
    });
  };

  const toggleResultSelection = resultId => {
    const index = selectedResults.findIndex(result => result.id === resultId);
    if (index !== -1) {
      setSelectedResults(prevState => prevState.filter(result => result.id !== resultId));
    } else {
      const result = allResults.find(result => result.id === resultId);
      if (result) {
        setSelectedResults(prevState => [...prevState, result]);
      }
    }
  };

  // to add a result to a race
  const addSelectedResultsToExistingRace = (raceId) => {
    db.transaction((tx) => {
        selectedResults.forEach((result, index) => {
            tx.executeSql(
                'INSERT INTO race_results (user_id, full_name, sail_no, race_class, race_time, laps, corrected_time, pn, race_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [loggedInUserId, result.full_name, result.sail_no, result.race_class, result.race_time, result.laps, result.corrected_time, result.pn, raceName],
                (_, success) => {
                    console.log('Result added to existing race:', result);
                    if (index === selectedResults.length - 1) {
                        navigation.navigate('RaceDetail', { raceName, selectedResults });
                        const remainingResults = allResults.filter(item => !selectedResults.includes(item));
                        setAllResults(remainingResults);
                        setSelectedResults([]);
                        setRaceName('');
                        Alert.alert('Success', `Selected results added to existing race "${raceName}".`);
                    }
                },
                (_, error) => {
                    console.error('Error adding result to existing race:', error);
                    Alert.alert('Error', `Failed to add result to existing race: ${error}`);
                }
            );
        });
    });
};

// to add a result to a race
  const addSelectedResultsToNewRace = () => {
    db.transaction((tx) => {
        selectedResults.forEach((result, index) => {
            tx.executeSql(
                'INSERT INTO race_results (user_id, full_name, sail_no, race_class, race_time, laps, corrected_time, pn, race_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [loggedInUserId, result.full_name, result.sail_no, result.race_class, result.race_time, result.laps, result.corrected_time, result.pn, raceName],
                (_, success) => {
                    console.log('Result added to new race:', result);
                    if (index === selectedResults.length - 1) {
                        navigation.navigate('RaceDetail', { raceName, selectedResults });
                        const remainingResults = allResults.filter(item => !selectedResults.includes(item));
                        setAllResults(remainingResults);
                        setSelectedResults([]);
                        setRaceName('');
                        Alert.alert('Success', `Selected results added to new race "${raceName}".`);
                    }
                },
                (_, error) => {
                    console.error('Error adding result to new race:', error);
                    Alert.alert('Error', `Failed to add result to new race: ${error}`);
                }
            );
        });
    });
  };

  // to add a result to a race
  const addSelectedResultsToRace = () => {
    if (!raceName) {
        Alert.alert('Error', 'Please enter a race name.');
        setSelectedResults([]);
        return;
    }

    if (selectedResults.length === 0) {
        Alert.alert('Error', 'No results selected.');
        return;
    }

    db.transaction((tx) => {
        tx.executeSql(
            'SELECT * FROM race_results WHERE race_name = ? LIMIT 1',
            [raceName],
            (_, { rows }) => {
                if (rows.length > 0) {
                    const existingRaceId = rows.item(0).id;
                    addSelectedResultsToExistingRace(existingRaceId);
                } else {
                    addSelectedResultsToNewRace();
                }
            },
            (_, error) => {
                console.error('Error checking race existence:', error);
                Alert.alert('Error', 'Failed to check if the race already exists.');
            }
        );
    });
  };

  // to delete results - the same across all pages
  const deleteResult = (resultId) => {
    Alert.alert(
      "Confirm Deletion",
      "Deleting this result permanently removes it from the database. Are you sure you want to?",
      [
          {
              text: "No",
              style: "cancel",
          },
          {
              text: "Yes",
              onPress: () => handleDeleteConfirmation(resultId),
          },
      ]
  );
  };

  const handleDeleteConfirmation = (resultId) => {
    const updatedResults = allResults.filter((result) => result.id !== resultId);
    setAllResults(updatedResults);
    setSelectedResults(selectedResults.filter((result) => result.id !== resultId));
    // removing the result from the database
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM race_results WHERE id = ?',
        [resultId],
        () => {
          console.log('Result deleted successfully');
        },
        (_, error) => {
          console.error('Error deleting result:', error);
        }
      );
    });
  }

  const selectAllResults = () => {
    setSelectedResults(allResults);
  }

  

  return (
    // this is where all the results are rendered onto the page
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Races')} style={styles.loginButton}>
             <Text style={styles.loginText}>Races</Text>
      </TouchableOpacity>
      <Text style={styles.resultsHeading}>Your Race Results:</Text>
      <Button title="Select All" onPress={selectAllResults}/>
      {!selectedResults.length > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('OverviewScreen', { lapTimes })}
          style={{ marginTop: 20 }}
        >
          <Text style={{ fontSize: 18, color:'dodgerblue' }}>View Overview</Text>
        </TouchableOpacity>
      )}


      <FlatList
        data={allResults}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.resultItem,
              selectedResults.some(result => result.id === item.id) && styles.selectedResult,
              item.race_time === 'DNF' && styles.dnfResult,
              item.race_time === 'DNS' && styles.dnsResult,
            ]}
            onPress={() => toggleResultSelection(item.id)}
          >
            <Text>Name: {item.full_name}</Text>
            <Text>SailNo: {item.sail_no}</Text>
            <Text>Class: {item.race_class}</Text>
            <Text>Original Time: {item.race_time}</Text>
            <Text>Portsmouth Number (PN): {item.pn}</Text>
            <Text>Corrected Time (mins): {Number(item.corrected_time / 60).toFixed(2)}</Text>
            <Text>Laps: {item.laps}</Text>
            <Text>Average Time (mins): {Number(item.corrected_time / (60 * item.laps)).toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteResult(item.id)}
            >
              <Text style={styles.deleteText}>X</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {selectedResults.length > 0 && (
        
        <View style={styles.selectedResultsContainer}>
          
          <Text>Selected Results:</Text>
          <FlatList
            data={selectedResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.selectedResultItem} key={item.id}>
                <Text>Name: {item.full_name}</Text>
                <Text>SailNo: {item.sail_no}</Text>
                <Text>Class: {item.race_class}</Text>
                <Text>Original Time: {item.race_time}</Text>
                <Text>Portsmouth Number (PN): {item.pn}</Text>
                <Text>Corrected Time (mins): {Number(item.corrected_time / 60).toFixed(2)}</Text>
                <Text>Laps: {item.laps}</Text>
                <Text>Average Time (mins): {Number(item.corrected_time / (60 * item.laps)).toFixed(2)}</Text>
              </View>
            )}
          />
          <Button title="Add to Race" onPress={addSelectedResultsToRace} style={{position:'fixed' }}/>
        </View>
      )}
      
      <View style={styles.addRaceContainer}>
        <TextInput
            style={styles.raceNameInput}
            placeholder="Enter Race Name"
            value={raceName}
            onChangeText={(text) => setRaceName(text)}
          />
        </View>
      
      
    </View>

  );
} 

export default ResultsScreen;
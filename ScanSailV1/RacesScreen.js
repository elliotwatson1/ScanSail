import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, Button, TouchableOpacity, TextInput } from 'react-native';
import { openDatabase } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';

const db = openDatabase('RaceResults.db');

// page for all the different races created
const RacesScreen = () => {
    const [races, setRaces] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [lastDeletedRace, setLastDeletedRace] = useState(null); 
    const [lastDeletedRaceDetails, setLastDeletedRaceDetails] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        fetchRaces();
    }, []);

    const fetchRaces = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT DISTINCT race_name FROM race_results',
                [],
                (_, { rows }) => {
                    const raceNames = rows._array.map((item) => ({ name: item.race_name, highlighted: false }));
                    setRaces(raceNames);
                },
                (_, error) => {
                    console.error('Error fetching races:', error);
                }
            );
        });
    };

    const navigateToRaceDetail = (raceName) => {
        if (!raceName) {
            Alert.alert('Error', 'No race selected.');
            return;
        }
        navigation.navigate('RaceDetail', { raceName });
    };

    const toggleHighlightRace = (index) => {
        const updatedRaces = [...races];
        updatedRaces[index].highlighted = !updatedRaces[index].highlighted;
        setRaces(updatedRaces);
    };

    // search function to search for the race
    const renderRaceItem = ({ item, index }) => {
        const isHighlighted = item.highlighted;
        const raceName = item.name;
        const highlightStyle = isHighlighted ? styles.highlightedRace : null;

        return (
            <TouchableOpacity
                style={[styles.resultItem, highlightStyle]}
                onPress={() => navigateToRaceDetail(raceName)}
                onLongPress{...() => toggleHighlightRace(index)} 
            >
                <Text>{raceName}</Text>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteRace(raceName)}
                >
                    <Text style={styles.deleteText}>X</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    // function to delete a race from the database and all
    // of its details
    const deleteRace = (resultId) => {
        Alert.alert(
            "Confirm Deletion",
            "Deleting this race deletes for everyone. Are you sure you want to?",
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
        setLastDeletedRace(resultId);
    
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM race_results WHERE race_name = ?',
                [resultId],
                (_, { rows }) => {
                    const details = rows._array;
                    setLastDeletedRaceDetails(details);
                },
                (_, error) => {
                    console.error('Error fetching race details:', error);
                }
            );
        });
    
        const updatedRaces = races.filter((race) => race.name !== resultId); 
        setRaces(updatedRaces); 
    
        
        db.transaction((tx) => {
            tx.executeSql(
                'DELETE FROM race_results WHERE race_name = ? OR race_name IS NULL OR race_name = ""',
                [resultId],
                () => {
                    console.log('Race deleted successfully');
                },
                (_, error) => {
                    console.error('Error deleting race:', error);
                }
            );
        });
    };
    
    // function to get the last deleted race and all of its 
    // information back
    const restoreLastDeletedRace = () => {
        if (lastDeletedRace && lastDeletedRaceDetails) {
            const restoredRaceName = lastDeletedRace;
            const restoredRaceDetails = lastDeletedRaceDetails;
            
            db.transaction((tx) => {
                restoredRaceDetails.forEach((detail) => {
                    tx.executeSql(
                        'INSERT INTO race_results (race_name, full_name, sail_no, race_class, race_time, pn, corrected_time, laps) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [
                            restoredRaceName,
                            detail.full_name,
                            detail.sail_no,
                            detail.race_class,
                            detail.race_time,
                            detail.pn,
                            detail.corrected_time,
                            detail.laps,
                        ],
                        () => console.log('Race details restored successfully'),
                        (_, error) => console.error('Error restoring race details:', error)
                    );
                });
            });
    
            setRaces([...races, { name: restoredRaceName, highlighted: false }]);
    
            setLastDeletedRace(null);
            setLastDeletedRaceDetails(null);
        } else {
            Alert.alert('No Race to Restore', 'There is no race to restore.');
        }
    };
    

    const filterRaces = (query) => {
        setSearchQuery(query);
        const filtered = races.map((race) => ({
            name: race.name,
            highlighted: race.name && query && race.name.toLowerCase().includes(query.toLowerCase())
        }));
        const sortedRaces = filtered.sort((a, b) => {
            if (a.highlighted && !b.highlighted) return -1;
            if (!a.highlighted && b.highlighted) return 1;
            return 0;
        });
        setRaces(sortedRaces);
        };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Search Race..."
                value={searchQuery}
                onChangeText={filterRaces}
            />
            <Text style={styles.resultsHeading}>Race Results:</Text>
            <FlatList
                data={races}
                keyExtractor={(item) => item.name}
                renderItem={renderRaceItem}
            />
            <View style={styles.dell}>
                <Button title="Restore Last Deleted Race" onPress={restoreLastDeletedRace} />
            </View>
        </View>
    );
};

export default RacesScreen;

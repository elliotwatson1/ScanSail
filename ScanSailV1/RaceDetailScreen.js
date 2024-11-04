import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, Button, TextInput, TouchableOpacity } from 'react-native';
import { openDatabase } from 'expo-sqlite';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as MailComposer from 'expo-mail-composer';
import styles from './styles';

const db = openDatabase('RaceResults.db');

// function to see the results added to the race
const RaceDetailScreen = ({ route }) => {
    const [raceResults, setRaceResults] = useState([]);
    const [recipientEmail, setRecipientEmail] = useState('');
    const { raceName } = route.params || {};

    useEffect(() => {
        fetchRaceResults();
    }, []);

    const fetchRaceResults = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM race_results WHERE race_name = ?',
                [raceName],
                (_, { rows }) => {
                    const results = rows._array;
                    results.sort((a, b) => {
                        const avgTimeA = a.corrected_time / (60 * a.laps);
                        const avgTimeB = b.corrected_time / (60 * b.laps);
                        if (isNaN(avgTimeA)) return 1; 
                        if (isNaN(avgTimeB)) return -1; 
                        return avgTimeA - avgTimeB; 
                    });
                    setRaceResults(results);
                },
                (_, error) => {
                    console.error('Error fetching race results:', error);
                }
            );
        });
    };

    const saveRaceResultsToPDF = async () => {
        try {
            const htmlContent = generateHTMLContent(raceResults);
            const pdf = await Print.printToFileAsync({ html: htmlContent });

            const filePath = FileSystem.documentDirectory + `${raceName}_results.pdf`;
            await FileSystem.moveAsync({
                from: pdf.uri,
                to: filePath,
            });

            Alert.alert('Success', 'Race results saved as PDF.');
            sendEmailWithResults(filePath);
        } catch (error) {
            console.error('Error saving results to PDF:', error);
            Alert.alert('Error', 'Failed to save race results as PDF.');
        }
    };

    // generate a pdf for results in similar style to sailwave
    const generateHTMLContent = (results) => {
        const currentDate = new Date().toLocaleDateString();
        let htmlContent = `<h1>${raceName} Race Results - ${currentDate}</h1>`;
        htmlContent += '<table border="1">';
        htmlContent += '<tr style="background-color: darkblue; color: white;"><th>Position</th><th>Name</th><th>SailNo</th><th>Class</th><th>Original Time</th><th>Portsmouth Number</th><th>Corrected Time</th><th>Laps</th><th>Avg Time Per Lap</th><th>Points</th></tr>';

        const totalRacers = results.length;

        results.forEach((item, index) => {
            const position = isNaN(item.corrected_time / (60 * item.laps)) ? 'DNF' : index + 1;
            const points = isNaN(item.corrected_time / (60 * item.laps)) ? totalRacers + 1 : index + 1;
            const bgColor = index % 2 === 0 ? '#99ccff' : '#cceeff'; 
            htmlContent += `<tr style="background-color: ${bgColor};"><td>${position}</td><td>${item.full_name}</td><td>${item.sail_no}</td><td>${item.race_class}</td><td>${item.race_time}</td><td>${item.pn}</td><td>${Number(item.corrected_time / 60).toFixed(2)}</td><td>${item.laps}</td><td>${Number(item.corrected_time / (60 * item.laps)).toFixed(2)}</td><td>${points}</td></tr>`;
        });

        htmlContent += '</table>';

        return htmlContent;
    };

    // function to send an email of the pdf
    const sendEmailWithResults = async (filePath) => {
        const currentDate = new Date().toLocaleDateString();
        try {
            const options = {
                subject: `${raceName} Race Results - ${currentDate} `,
                body: `Please find attached the ${raceName} race results PDF.`,
                recipients: [recipientEmail],
                attachments: [filePath],
            };
            const result = await MailComposer.composeAsync(options);
            if (result.status === 'sent') {
                Alert.alert('Success', 'Email sent successfully.');
            } else {
                Alert.alert('Error', 'Failed to send email.');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            Alert.alert('Error', 'Failed to send email.');
        }
    };

    if (!raceName) {
        Alert.alert('No race selected.');
        return null;
    }

    const deleteResult = (resultId) => {
        db.transaction((tx) => {
            tx.executeSql(
                'DELETE FROM race_results WHERE id = ?',
                [resultId],
                () => {
                    console.log('Result deleted successfully');
                    fetchRaceResults();
                },
                (_, error) => {
                    console.error('Error deleting result:', error);
                }
            );
        });
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Enter recipient email"
                value={recipientEmail}
                onChangeText={setRecipientEmail}
            />
            <Button title="Save Race Results to PDF and Email" onPress={saveRaceResultsToPDF} />
            <Text style={styles.resultsHeading}>Race: {raceName}</Text>
            <FlatList
                data={raceResults}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.resultItem}>
                        <Text>Name: {item.full_name}</Text>
                        <Text>SailNo: {item.sail_no}</Text>
                        <Text>Class: {item.race_class}</Text>
                        <Text>Original Time: {item.race_time}</Text>
                        <Text>Portsmouth Number (PN): {item.pn}</Text>
                        <Text>Corrected Time (mins): {Number(item.corrected_time / 60).toFixed(2)}</Text>
                        <Text>Laps: {item.laps}</Text>
                        <Text>Average Time Per Lap (mins): {Number(item.corrected_time / (60 * item.laps)).toFixed(2)}</Text>
                        <Text>Points: {isNaN(item.corrected_time / (60 * item.laps)) ? raceResults.length + 1 : index + 1}</Text>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => deleteResult(item.id)}
                        >
                            <Text style={styles.deleteText}>X</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

export default RaceDetailScreen;

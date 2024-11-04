import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import styles from './styles';

// Simple page to tell a new user how to use the aoo and how it works in general
// \u2022 is a bullet point

const Instruction = () => {
    return (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.container}>
                <Text style={styles.heading}>Welcome to ScanSail!</Text>
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Registration</Text>
                    <Text style={styles.sectionDescription}>
                        In the registration page, you can create an account or login to an existing account. You can also use this page to logout of the account you are currently logged in to.
                    </Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Information</Text>
                    <Text style={styles.sectionDescription}>
                        The information page provides news from the sailing world and results from professional races happening. You can also access local weather through this page by clicking the the button at the bottom.
                    </Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Camera</Text>
                    <Text style={styles.sectionDescription}>
                        Use the camera to scan your race results into the application. Ensure all information is written in neat and clear capitals, and keep each piece of information to one line. The required order of information is: {'\n'}
                        <Text style={{ marginLeft: 20 }}>
                            {'\u2022'} FULL NAME{'\n'}
                            {'\u2022'} SAIL NUMBER{'\n'}
                            {'\u2022'} BOAT CLASS{'\n'}
                            {'\u2022'} TIME IN MM:SS{'\n'}
                            {'\u2022'} LAPS
                        </Text>
                    </Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Results</Text>
                    <Text style={styles.sectionDescription}>
                        View your saved results and add them to existing races or create your own race for others to see. Enter the race name you wish to create or add to in the text box at the bottom of the screen. Click "Add To Race" to add a result to the selected race folder. Also, if you click the "View Overview" button this will produce a line graph of the distribution of your average lap times from all your different results (This is best to see whether you're improving or not).
                    </Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Races</Text>
                    <Text style={styles.sectionDescription}>
                        View all races created from around the world and the results within them. Click on a race title to view its details. You can also use the search bar at the top too look for the race you're after.
                    </Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Race Details</Text>
                    <Text style={styles.sectionDescription}>
                        View all details of a race. Enter your email in the text input space at the top and click "Save Race Results to PDF and Email" to receive a PDF of the results via email.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

export default Instruction;




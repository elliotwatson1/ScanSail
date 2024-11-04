import React, { useState , useEffect} from 'react';
import { View, TouchableOpacity, Text, TextInput, Button, Alert, KeyboardAvoidingView, LogBox } from 'react-native';
import { openDatabase } from 'expo-sqlite';
import styles from './styles';
import bcrypt from 'react-native-bcrypt';
import { useAuth } from './AuthProvider';
import PasswordStrengthMeterBar from 'react-native-password-strength-meter-bar';
import {useFocusEffect} from '@react-navigation/native';

LogBox.ignoreAllLogs();

const db = openDatabase('RaceResults.db');

const initialiseDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, race_name TEXT);',
      [],
      (_, success) => {
        // console.log('Table "users" created successfully:', success);
      },
      (_, error) => {
        // console.error('Error creating table "users":', error);
      }
    );
  });
};

// function to register new accounts to the database
function RegistrationScreen({ navigation }) {


  initialiseDatabase();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setLoggedInUserId } = useAuth();
  const {logout, loggedInUserId} = useAuth();
  const [confirmPassword, setConfirmPassword] = useState('');

  const resetInputs = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  }

  const { username: loggedInUsername} = loggedInUserId || {}; 

  const handleLogout = () => {
    console.log("Attempting to logout...");
    logout();
  };

  useFocusEffect(
    React.useCallback(() => {
      resetInputs(); 
    }, [])
  );

  // function to generate a suggested username if the username
  // you're trying to register with already exists
  const generateSuggestedUsername = (username, existingUsers) => {
    let suggestedUsername = username;
    let counter = 1;
    while (existingUsers.some((user) => user.username === suggestedUsername)) {
      const randomNumber = Math.floor(Math.random() * 100); 
      suggestedUsername = `${username}${randomNumber}`;
      counter++;
    }
    return suggestedUsername;
  };

  // database transaction to register a new account
  const register = () => {
    if (username && password && confirmPassword && password ===confirmPassword) {
      navigation.navigate('LoadingScreen');
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM users WHERE username = ?',
          [username],
          (_, { rows }) => {
            const existingUsers = rows._array || [];
            if (existingUsers.length > 0) {
              let suggestedUsername = generateSuggestedUsername(username, existingUsers);
              Alert.alert(
                'Username already exists',
                `The username '${username}' is already taken. You can use '${suggestedUsername}' instead. Please click the back button in the top left corner to go back.`
                

              );
            } else {
              const salt = bcrypt.genSaltSync(10);
              const hashedPassword = bcrypt.hashSync(password + 'pepper', salt);
      
              tx.executeSql(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                [username, hashedPassword],
                (_, { insertId }) => {
                  console.log('User registered with ID: ' + insertId);
                  setLoggedInUserId(insertId);
                  navigation.navigate('Login', { username, password });
                  
                },
                (_, error) => {
                  console.error('Error registering user:', error);
                }
              );
              resetInputs();
            }
          },
          (_, error) => {
            console.error('Error checking existing users:', error);
          }
        );
      });
      resetInputs();
    } else {
      Alert.alert('Please enter username and password',
      'Passwords must match!');
      resetInputs();
    }
    setUsername('');
    setPassword('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 1 }}>
        <PasswordStrengthMeterBar password={password} radius={20} height={10} showStrenghtText={true} width={100}/>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
      {/* a attempt to show the username of the user logged in */}
      {/* <Text>Logged In: {loggedInUsername}</Text>  */}
      <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="New Username"
        onChangeText={setUsername}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title={showPassword ? "Hide" : "Show"}
            onPress={() => setShowPassword(!showPassword)}
          />
        </View>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry={!showPassword}
        onChangeText={setConfirmPassword}
      />
    </View>

      
      <TouchableOpacity onPress={register} style={styles.registerButton}>
        <Text style={styles.registerText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

export default RegistrationScreen;

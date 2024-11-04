import React, { useState } from 'react';
import { View, TextInput, Button, KeyboardAvoidingView, Platform, Text, TouchableOpacity, Alert } from 'react-native';
import { openDatabase } from 'expo-sqlite';
import styles from './styles';
import bcrypt from 'react-native-bcrypt';
import { useAuth } from './AuthProvider';
import LoadingScreen from './LoadingScreen'; 

const db = openDatabase('RaceResults.db');

// initialising the database so it functions across all the pages
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

function LoginScreen({ navigation }) {
  initialiseDatabase();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setLoggedInUserId } = useAuth();

  const resetInputs = () => {
    setUsername('');
    setPassword('');
  }

  // database transaction for the login process
  const login = () => {
    if (username && password) {
      navigation.navigate('LoadingScreen'); 
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM users WHERE username = ?',
          [username],
          (_, { rows }) => {
            if (rows.length > 0) {
              const user = rows.item(0);
              const storedHashedPassword = user.password;
              
              const salt = storedHashedPassword.substring(0, 29);
              
              const hashedInputPassword = bcrypt.hashSync(password + 'pepper', salt);

              if (storedHashedPassword === hashedInputPassword) {
                console.log('Logging in...');
                setLoggedInUserId(user.id);
                // this has basically been put in place for new member to read the instructions
                // before heading on to th rest of the application
                Alert.alert(
                  'Login Successful',
                  'Do you want to see the instructions?',
                  [
                    { text: 'No', onPress: () => navigation.navigate('Information') },
                    { text: 'Yes', onPress: () => navigation.navigate('Instructions') }
                  ]
                );
              } else {
                Alert.alert('Invalid credentials');
              }
            } else {
              Alert.alert('Invalid credentials');
            }
          },
          (_, error) => {
            console.error('Error querying user:', error);
          }
        );
      });
      resetInputs();
    } else {
      Alert.alert('Please enter username and password');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          onChangeText={setUsername}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
          />
          <Button
            title={showPassword ? "Hide" : "Show"}
            onPress={() => setShowPassword(!showPassword)}
          />
        </View>
      </View>
      <TouchableOpacity onPress={login} style={styles.loginButton2}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;

// A failed dead-end at an attempt to be able
// to reset the password connected to your username






import React, { useState } from 'react';
import { View, TextInput, Button, KeyboardAvoidingView, Platform, Text, TouchableOpacity, Alert } from 'react-native';
import { openDatabase } from 'expo-sqlite';
import styles from './styles';
import bcrypt from 'react-native-bcrypt';
import * as Email from 'expo-mail-composer';

const db = openDatabase('RaceResults.db');

const initialiseDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, email TEXT, password TEXT, race_name TEXT);',
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

const ResetPasswordScreen = ({ navigation }) => {
  initialiseDatabase();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);


  const resetInputs = () => {
    setUsername('');
    setEmail('');
    setResetCode('');
    setNewPassword('');
  };

  const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendCode = async () => {
    if (username && email) {
      try {
        const registrationResult = await db.transaction(async (tx) => {
          try {
            const result = await tx.executeSql(
              'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
              [username, email, ''],
            );
            return result;
          } catch (insertError) {
            console.error('Error inserting user:', insertError);
            return { error: insertError };
          }
        });
  
        console.log('Registration Result:', registrationResult);
  
        // if (registrationResult && registrationResult.error) {
        //   Alert.alert('User registration failed');
        //   return;
        // }
  
        if (registrationResult && registrationResult.rowsAffected > 0) {
         
          const code = generateResetCode();
          setResetCode(code);
          await sendResetCode(code, email);
          setIsCodeSent(true);
        } else {
          Alert.alert('User registration failed');
        }
      } catch (error) {
        console.error('Error registering user:', error);
        Alert.alert('Error registering user:', error.message);
      }
    } else {
      Alert.alert('Please enter username and email');
    }
  };
  
  

  const sendResetCode = async (code, emailAddress) => {
    try {
      await Email.composeAsync({
        recipients: [emailAddress],
        subject: 'Password Reset Code',
        body: `Your password reset code is: ${code}`,
      });
      Alert.alert('Reset code sent');
    } catch (error) {
      console.error('Error sending email:', error);
      Alert.alert('Error sending email:', error.message);
    }
  };

  const handleResetPassword = () => {
    if (resetCode && newPassword) {
      if (resetCode === enteredResetCode) {
        try {
          db.transaction((tx) => {
            tx.executeSql(
              'UPDATE users SET password = ? WHERE username = ?',
              [bcrypt.hashSync(newPassword, 10), username],
              (_, { rowsAffected }) => {
                if (rowsAffected > 0) {
                  Alert.alert('Password reset successful');
                  resetInputs();
                  navigation.navigate('Login');
                } else {
                  Alert.alert('Failed to reset password');
                }
              },
              (_, error) => {
                console.error('Error updating password:', error);
                Alert.alert('Error updating password:', error.message);
              }
            );
          });
        } catch (error) {
          console.error('Error resetting password:', error);
          Alert.alert('Error resetting password:', error.message);
        }
      } else {
        Alert.alert('Invalid reset code');
      }
    } else {
      Alert.alert('Please enter reset code and new password');
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
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        {!isCodeSent ? (
          <TouchableOpacity onPress={handleSendCode} style={styles.resetPasswordButton}>
            <Text style={styles.resetPasswordText}>Send Reset Code</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Reset Code"
              onChangeText={setResetCode}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              onChangeText={setNewPassword}
              secureTextEntry={true}
            />
            <TouchableOpacity onPress={handleResetPassword} style={styles.resetPasswordButton}>
              <Text style={styles.resetPasswordText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;

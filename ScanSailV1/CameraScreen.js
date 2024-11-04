import React, { useState, useRef, useEffect } from 'react';
import { View, Button, TouchableOpacity, Text, Image, Alert} from 'react-native';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { CameraType } from 'expo-camera';
import styles from './styles';

// Page for the text detection process

function CameraScreen({ navigation }) {
  const [type, setType] = useState(CameraType.back);
  const [image, setImage] = useState(null);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef(null);
  const [detectedText, setDetectedText] = useState('');
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    if(showAlert){
      Alert.alert(
        'Welcome to ScanSailV1. This is a quick intro on how to use the app.',
        'Make sure all your writing is in neat and clear capitals.\nKeep all your info to one line each.\nThe order of info required is:\nFULL NAME\nSAIL NUMBER\nBOAT CLASS\nTIME IN MM:SS\nLAPS',
        [{text: 'OK', onPress: () => console.log('OK pressed')}]
      );
      setShowAlert(false);
    }
  },[]);

  const manual = (detectedText) => {
    try {
      if (detectedText.trim()) {
        // read detected text and split each line for each text input 
        const lines = detectedText.split('\n').map(line => line.trim());
        const [fullName, sailNo, raceClass, raceTime, laps] = lines.slice(0, 5);

        navigation.navigate('Manual', {
          detectedText,
          fullName: fullName || '',
          sailNo: sailNo || '',
          raceClass: raceClass || '',
          raceTime: raceTime || '',
          laps: laps || '',
        });
      } else {
        // if transfer fails popup
        Alert.alert(
          'Oops...',
          'Failed to transfer text. Please try again.',
          [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
        );
      }
    } catch (error) {
      console.error('Error navigating to ManualScreen:', error);
      Alert.alert(
        'Navigation Error',
        'Failed to navigate to Manual screen. Please try again.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
      );
    }
  };

  // process to get camera permission and nake sure image taken properly
  const takePicture = async () => {
    const cameraStatus = await Camera.requestCameraPermissionsAsync();

    if (cameraStatus.status === 'granted') {
      try {
        if (cameraRef) {
          const { uri } = await cameraRef.current.takePictureAsync();
          await FileSystem.copyAsync({
            from: uri,
            to: FileSystem.documentDirectory + 'camera.jpg',
          });

          setImage(uri);
          alert('Please wait a moment while we process your results.');

          await performTextDetection(uri);
        }
      } catch (e) {
        console.error('Error taking picture:', e);
      }
    } else {
      alert('No access to camera. Please grant camera permission in your device settings.');
    }
  };

  // perform the text detection using the google cloud API
  const performTextDetection = async (uri) => {
    try {
      const imageData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const apiKey = 'AIzaSyA0zQJ8gO4L_h9uOLxtaOYMjXTg6p3pU0E';

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: imageData,
                },
                features: [
                  {
                    type: 'TEXT_DETECTION',
                  },
                ],
              },
            ],
          }),
        }
      );

      const result = await response.json();
      const detectedText = result.responses[0]?.fullTextAnnotation?.text || '';
      console.log('Detected Text:', detectedText);

      setDetectedText(detectedText);
    } catch (error) {
      console.error('Text detection error:', error);
    }
  };

  useEffect(() => {
    if (detectedText.trim()) {
      manual(detectedText);
    } else {
      console.log('No text detected.');
    }
  }, [detectedText]);

  return (
    <View style={styles.container}>
      {image ? (
        <Image source={{ uri: image }} style={styles.camera} />
      ) : (
        <Camera
          style={styles.camera}
          type={type}
          flashMode={flash}
          ref={cameraRef}
        />
      )}

      {image ? (
        <Button title="Take Another Picture" onPress={() => setImage(null)} />
      ) : (
        <Button title="Scan" onPress={takePicture} />
      )}
      <TouchableOpacity onPress={() => {
        const lines = detectedText.split('\n').map(line => line.trim());
        const [fullName, sailNo, raceClass, raceTime, laps] = lines;
        navigation.navigate('Manual', {
          detectedText,
          fullName,
          sailNo,
          raceClass,
          raceTime,
          laps
        });
      }} style={styles.loginButton}>
        <Text style={styles.loginText}>Manually input results</Text>
      </TouchableOpacity>

    </View>
  );
}

export default CameraScreen;

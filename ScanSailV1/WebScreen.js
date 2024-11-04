import React, { useState, useEffect } from 'react';
import { View, Button, SafeAreaView, StatusBar, Text, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import styles from './styles';
import { WebView } from 'react-native-webview';

// function to show information on sailing and
// also show weather
function WebScreen({ navigation }) {
    const [showWeather, setShowWeather] = useState(false);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fetchingWeather, setFetchingWeather] = useState(false);
    const [location, setLocation] = useState('Unknown Location');

    useEffect(() => {
        if (showWeather && latitude && longitude) {
            fetchWeather();
            fetchAddress(latitude, longitude);
        }
    }, [showWeather, latitude, longitude]);

    // using open weather api for the weather details
    const fetchWeather = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=f64aa785415e2430c03700c2f047047c&units=metric`
            );
            const data = await response.json();
            if (data.cod && data.cod !== 200) {
                setError(data.message);
            } else {
                setWeatherData(data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching weather:', error);
            setError('Error fetching weather. Please try again later.');
            setLoading(false);
        }
    };

    // calculating actual direction rather than angle
    const compassDirections = [
        'North', 'North-Northeast', 'Northeast', 'East-Northeast',
        'East', 'East-Southeast', 'Southeast', 'South-Southeast',
        'South', 'South-Southwest', 'Southwest', 'West-Southwest',
        'West', 'West-Northwest', 'Northwest', 'North-Northwest'
    ];
    
    const getCompassDirection = (deg) => {
        const val = Math.floor((deg / 22.5) + 0.5);
        return compassDirections[val % 16];
    };

    // using the same google cloud API used for text-detection to get location for the weather
    const fetchAddress = async (latitude, longitude) => {
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyA0zQJ8gO4L_h9uOLxtaOYMjXTg6p3pU0E`);
            if (response.data && response.data.results && response.data.results.length > 0) {
                const address = response.data.results[0].formatted_address;
                setLocation(address);
            } else {
                setLocation('Unknown Location');
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            setLocation('Unknown Location');
        }
    };

    const getLocation = async () => {
        setFetchingWeather(true);
        
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Location permission denied');
            setFetchingWeather(false);
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
        setShowWeather(true);
        setFetchingWeather(false);
    };

    const toggleView = () => {
        setShowWeather(!showWeather);
    };

    // function to get the arrows in direction of the wind
    const renderWindArrows = () => {
        if (weatherData && weatherData.wind) {
            const arrowMarkers = [];
            const numArrows = 90; 
            const centralPoint = { latitude, longitude };
            const maxDistance = 0.03; 
    
            for (let i = 0; i < numArrows; i++) {
                const randomLatitude = centralPoint.latitude + (Math.random() - 0.5) * 2 * maxDistance;
                const randomLongitude = centralPoint.longitude + (Math.random() - 0.5) * 2 * maxDistance;
                // for some reason 270 worked
                const rotation = weatherData.wind.deg + 270; 
    
                arrowMarkers.push(
                    <Marker
                        key={i}
                        coordinate={{ latitude: randomLatitude, longitude: randomLongitude }}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <Image
                            source={require('./arrow.png')}
                            style={{ width: 40, height: 20, resizeMode: 'contain', transform: [{ rotate: `${rotation}deg` }] }}
                        />
                    </Marker>
                );
            }
    
            return arrowMarkers;
        }
    
        return null;
    };
    
    // to render the info page and the weatrher page with the arros
    return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={{ flex: 1 }}>
                {fetchingWeather ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'dodgerblue' }}>
                        <Text style={{ color: 'white', fontSize: 20, marginBottom: 20 }}>Loading...</Text>
                        <ActivityIndicator size="large" color="white" />
                    </View>
                ) : showWeather ? (
                    <View style={{ flex: 1 }}>
                        <MapView
                            style={{ flex: 1 }}
                            initialRegion={{
                                latitude: latitude,
                                longitude: longitude,
                                latitudeDelta: 0.09,
                                longitudeDelta: 0.04,
                            }}
                        >
                            <Marker
                                coordinate={{ latitude: latitude, longitude: longitude }}
                                title="Your Location"
                            />
                            {renderWindArrows()}
                        </MapView>
                        <View style={{ position: 'absolute', top: 20, alignSelf:'center', backgroundColor: 'dodgerblue', padding: 10, borderRadius: 10 }}>
                            <Text style={{ fontSize: 16 ,color:'white'}}>Location: {location}</Text>
                            {loading ? (
                                <ActivityIndicator size="small" color="black" />
                            ) : error ? (
                                <Text style={{ color: 'red' }}>{error}</Text>
                            ) : weatherData ? (
                                <>
                                    <Text style={{color:'white',fontSize: 16}}>Temperature: {weatherData.main.temp}°C</Text>
                                    <Text style={{color:'white',fontSize: 16}}>Description: {weatherData.weather[0].description.toUpperCase()}</Text>
                                    <Text style={{color:'white',fontSize: 16}}>Wind Speed: {weatherData.wind.speed} m/s</Text>
                                    <Text style={{color:'white',fontSize: 16}}>Wind Direction:  {getCompassDirection(weatherData.wind.deg).toUpperCase()}</Text>
                                </>
                            ) : null}
                        </View>
                        <TouchableOpacity onPress={toggleView} style={{ position: 'absolute', bottom: 20, alignSelf: 'center', backgroundColor: 'dodgerblue', padding: 10, borderRadius: 10 }}>
                            <Text style={{color:'white',fontSize: 16}}>Go back to "Info"</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // windy.com to show my attempt at creating the current best info page 
                    <View style={{ flex: 1 }}>
                        {/* <WebView source={{ uri: 'https://www.windy.com/' }} /> */}
                        <WebView source={{ uri: 'https://www.sailing.org' }} />
                        <Button title="View Local Weather" onPress={getLocation} />
                    </View>
                )}
            </SafeAreaView>
        </>
    );
}

export default WebScreen;

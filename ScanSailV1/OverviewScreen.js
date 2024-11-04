import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useRoute } from '@react-navigation/native';
import Menu, { MenuItem, MenuDivider } from 'react-native-popup-menu';

// simple screen to get a line graph of your results to see
// how you are performing over time
function OverviewScreen() {
  const route = useRoute();
  const { lapTimes } = route.params || {}; 
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  const filteredLapTimes = lapTimes.filter(time => !isNaN(time));

  const allSame = filteredLapTimes.every((val, i, arr) => val === arr[0]);

  if (allSame) {
    if (!filteredLapTimes || filteredLapTimes.length === 0) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>No results available.</Text>
          </View>
        );
      }
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>All result times are the same: {filteredLapTimes[0].toFixed(2)} min</Text>
      </View>
    );
    
  }

  const labels = Array.from({ length: filteredLapTimes.length }, (_, i) => `${i + 1}`);

  if (!filteredLapTimes || filteredLapTimes.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>No results available.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '90deg' }] }}>
      <Text>Graph to show how your average lap time varies</Text>
      <LineChart
        data={{
          labels: labels,
          datasets: [{ data: filteredLapTimes }],
        }}
        width={600} 
        height={300} 
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`, 
          style: {
            borderRadius: 16,
          },
          fromZero: true, 
          yAxisInterval: 1,
           
        }}
        bezier 
      />
    </View>
  );
}

export default OverviewScreen;

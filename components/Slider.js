import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Slider from "@react-native-community/slider";

export default function SliderComponent({ passSteps, passGuidance }) {
  const [samplingValue, setSamplingValue] = React.useState(45);
  const [guidanceValue, setGuidanceValue] = React.useState(10);
  
 
  // Handle sampling steps change
  const handleStepChange = (x) => {
    setSamplingValue(x);
    passSteps(x);
  }

  // Handle guidance change
  const handleGuidanceChange = (x) => {
    setGuidanceValue(parseFloat(x.toFixed(2)));
    passGuidance(parseFloat(x.toFixed(2)));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.captionText}>Sampling Steps</Text>
      <Slider
        style={styles.slider}
        minimumValue={3}
        maximumValue={50}
        step={1}
        value={samplingValue}
        minimumTrackTintColor="#958DA5"
        maximumTrackTintColor="#9DA58D"
        thumbTintColor='#6750A4'
        onValueChange={handleStepChange}
      />
      <Text style={styles.sliderValue}>{samplingValue}</Text>
      <Text style={styles.captionText}>Guidance</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={10}
        step={0.1}
        value={guidanceValue}
        minimumTrackTintColor="#958DA5"
        maximumTrackTintColor="#9DA58D"
        thumbTintColor='#6750A4'
        onValueChange={handleGuidanceChange}
      />
      <Text style={styles.sliderValue}>{guidanceValue}</Text>
    </View>
  );
}

const colors = {
  color: '#FFFFFF',
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 50,
  },
  slider: {
    width: 350,
    height: 40,
  },
  captionText: {
    color: colors.color,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 3,
    width: 350,
  },
  sliderValue: {
    color: colors.color,
    fontSize: 18,
    letterSpacing: 3,
    textAlign: 'center',
    paddingBottom: 30,
    width: 350,
  },
  
});

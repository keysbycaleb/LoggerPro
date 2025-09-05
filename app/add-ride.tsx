
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AddRideScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Ride</Text>
      {/* Form to add a new ride will go here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

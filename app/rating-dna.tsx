
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RatingDnaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Rating DNA</Text>
      {/* Preferences setup will go here */}
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

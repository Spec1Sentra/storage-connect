import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CircleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Circle Screen</Text>
      <Text style={styles.subtext}>This is a placeholder screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 16,
    color: 'gray',
    marginTop: 8,
  },
});

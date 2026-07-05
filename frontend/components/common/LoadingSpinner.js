import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fdecea',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginBottom: 16,
  },
  text: {
    color: '#ef4444',
    fontSize: 14,
  },
});
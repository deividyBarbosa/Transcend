import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../theme/fonts';

interface ErrorMessageProps {
  message: string | null;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDECEA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#B71C1C',
    lineHeight: 20,
  },
});

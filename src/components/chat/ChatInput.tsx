// resolver o scroll? talvez aqui mesmo

import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
}

export default function ChatInput({
  value,
  onChangeText,
  onSend,
  placeholder = 'Digite uma mensagem...',
}: ChatInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={1000}
      />
      <TouchableOpacity
        style={[styles.enviarButton, !value.trim() && styles.enviarButtonDisabled]}
        onPress={onSend}
        disabled={!value.trim()}
      >
        <Ionicons
          name="send"
          size={20}
          color={value.trim() ? colors.white : colors.muted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 8,
  },
  anexoButton: {
    padding: 4,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
  },
  enviarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enviarButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
});
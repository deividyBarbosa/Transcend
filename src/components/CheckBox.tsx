import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface CheckBoxProps {
  label: string;
  checked: boolean;
  onPress: () => void;
}

export default function CheckBox({ label, checked, onPress }: CheckBoxProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.muted,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
});
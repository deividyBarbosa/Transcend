import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'outline';
  fullWidth?: boolean;
}

export default function Button({ 
  title, 
  onPress, 
  disabled, 
  loading,
  variant = 'primary',
  fullWidth = true 
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'outline' && styles.outline,
        (disabled || loading) && styles.disabled,
        !fullWidth && styles.auto,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
      ) : (
        <Text style={[
          styles.text,
          variant === 'outline' && styles.outlineText,
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 55,
    backgroundColor: colors.primary,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  auto: {
    width: 'auto',
    paddingHorizontal: 30,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
  outlineText: {
    color: colors.primary,
  },
});
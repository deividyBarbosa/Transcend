import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

interface PadraoItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
}

export default function PadraoItem({ icon, iconColor, title, subtitle }: PadraoItemProps) {
  return (
    <View style={styles.padraoItem}>
      <Ionicons name={icon} size={20} color={iconColor} />
      <View style={styles.padraoContent}>
        <Text style={styles.padraoTitle}>{title}</Text>
        <Text style={styles.padraoSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  padraoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  padraoContent: {
    flex: 1,
  },
  padraoTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  padraoSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
});
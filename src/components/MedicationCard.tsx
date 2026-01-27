import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface MedicationCardProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onEdit?: () => void;
  onPress?: () => void;
  variant?: 'default' | 'add';
}

export default function MedicationCard({
  icon = 'medical-outline',
  title,
  subtitle,
  onEdit,
  onPress,
  variant = 'default',
}: MedicationCardProps) {
  const isAdd = variant === 'add';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.cardIcon}>
        <Ionicons 
          name={isAdd ? 'add-circle' : icon} 
          size={18} 
          color={isAdd ? colors.primary : colors.text} 
        />
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, isAdd && { color: colors.primary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        )}
      </View>
      {onEdit && (
        <TouchableOpacity onPress={onEdit}>
          <Ionicons name="create-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.iconBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
});
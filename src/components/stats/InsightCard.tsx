import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

interface InsightCardProps {
  insights: string[];
}

export default function InsightCard({ insights }: InsightCardProps) {
  return (
    <View style={styles.insightCard}>
      <Ionicons name="bulb" size={20} color={colors.primary} />
      <View style={{ flex: 1 }}>
        {insights.map((insight, index) => (
          <Text key={index} style={styles.insightText}>
            {insights.length > 1 ? '• ' : ''}{insight}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  insightCard: {
    backgroundColor: '#FFE8ED',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 12,
  },
  insightText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
});
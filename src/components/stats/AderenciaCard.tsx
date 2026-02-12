import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

interface AderenciaCardProps {
  taxaAdesao: number;
  noHorario: number;
  atrasadas: number;
  atrasoMedio: number;
}

export default function AderenciaCard({
  taxaAdesao,
  noHorario,
  atrasadas,
  atrasoMedio,
}: AderenciaCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>ADERÊNCIA GERAL</Text>
      <Text style={styles.bigNumber}>{taxaAdesao}%</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${taxaAdesao}%` }]} />
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{noHorario}</Text>
          <Text style={styles.statLabel}>NO HORÁRIO</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#FF9800' }]}>
            {atrasadas}
          </Text>
          <Text style={styles.statLabel}>ATRASADAS</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{atrasoMedio}m</Text>
          <Text style={styles.statLabel}>ATRASO MÉDIO</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  cardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  bigNumber: {
    fontFamily: fonts.bold,
    fontSize: 48,
    color: colors.primary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
  },
});
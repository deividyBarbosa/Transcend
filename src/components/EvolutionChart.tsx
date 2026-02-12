import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import Button from '@/components/Button';

interface EvolutionChartProps {
  currentLevel: string;
  percentageChange: string;
  data: number[];
  labels: string[];
  onViewDetails?: () => void;
}

export default function EvolutionChart({
  currentLevel,
  percentageChange,
  data,
  labels,
  onViewDetails,
}: EvolutionChartProps) {
  const isPositive = percentageChange.startsWith('+');
  
  return (
    <View style={styles.evolutionCard}>
      <View style={styles.evolutionHeader}>
        <View>
          <Text style={styles.level}>{currentLevel}</Text>
          <Text style={styles.evolutionText}>
            Últimos {labels.length} meses {percentageChange}
          </Text>
        </View>
        <View style={[
          styles.evolutionBadge,
          { backgroundColor: isPositive ? '#E8F5E9' : '#FFEBEE' }
        ]}>
          <Ionicons 
            name={isPositive ? 'trending-up' : 'trending-down'} 
            size={20} 
            color={isPositive ? '#4CAF50' : '#F44336'} 
          />
          <Text style={[
            styles.evolutionBadgeText,
            { color: isPositive ? '#4CAF50' : '#F44336' }
          ]}>
            {percentageChange}
          </Text>
        </View>
      </View>

      <LineChart
        data={{
          labels: labels,
          datasets: [{ data: data }],
        }}
        width={Dimensions.get('window').width - 80}
        height={180}
        chartConfig={{
          backgroundColor: colors.white,
          backgroundGradientFrom: colors.white,
          backgroundGradientTo: colors.white,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(214, 92, 115, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(153, 153, 153, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: colors.primary,
          },
        }}
        bezier
        style={styles.chart}
      />

      {onViewDetails && (
        <Button 
          title="Ver Estatísticas Detalhadas"
          onPress={onViewDetails}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  evolutionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  evolutionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  level: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.text,
  },
  evolutionText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  evolutionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  evolutionBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '@/theme/colors';

interface SimpleLineChartProps {
  data: number[];
  labels: string[];
}

export default function SimpleLineChart({ data, labels }: SimpleLineChartProps) {
  return (
    <View style={styles.container}>
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
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: colors.primary,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  chart: {
    borderRadius: 16,
  },
});
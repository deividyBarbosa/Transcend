import React from "react";
import { StyleSheet, View, Text } from "react-native";

interface ProfileStatsProps {
  experiencia: number;
}

export function ProfileStats({
  experiencia,
}: ProfileStatsProps) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{experiencia} {experiencia === 1 ? 'ano' : 'anos'}</Text>
        <Text style={styles.statLabel}>EXPERIÊNCIA</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginHorizontal: 24,
    backgroundColor: "#FFF5F7",
    borderRadius: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3D2B2E",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },
});

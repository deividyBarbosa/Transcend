import React from "react";
import { StyleSheet, View, Text } from "react-native";

interface ProfileStatsProps {
  pacientes: number;
  experiencia: number;
}

export function ProfileStats({
  pacientes,
  experiencia,
}: ProfileStatsProps) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{pacientes}+</Text>
        <Text style={styles.statLabel}>PACIENTES</Text>
      </View>

      <View style={styles.statDivider} />

      <View style={styles.statItem}>
        <Text style={styles.statValue}>{experiencia} anos</Text>
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
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#F3E8EB",
  },
});

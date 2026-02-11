import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";

interface AgendamentoCardProps {
  patientName: string;
  patientPhoto?: any;
  sessionType: string;
  date: string;
  time: string;
  badge?: 'HOJE' | 'AMANHA' | null;
  onPress: () => void;
}

export function AgendamentoCard({
  patientName,
  patientPhoto,
  sessionType,
  date,
  time,
  badge = null,
  onPress,
}: AgendamentoCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.patientInfo}>
          {patientPhoto ? (
            <Image source={patientPhoto} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person-outline" size={20} color="#666666" />
            </View>
          )}

          <View style={styles.info}>
            <Text style={styles.name}>{patientName}</Text>
            <View style={styles.sessionTypeContainer}>
              <Ionicons name="clipboard-outline" size={14} color="#666666" />
              <Text style={styles.sessionType}>{sessionType}</Text>
            </View>
          </View>
        </View>

        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color="#666666" />
          <Text style={styles.detailText}>{date}</Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#666666" />
          <Text style={styles.detailText}>{time}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Ver Detalhes</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  patientInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  photo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  photoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  sessionTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sessionType: {
    fontSize: 14,
    fontWeight: "400",
    color: "#666666",
  },
  badge: {
    backgroundColor: "#FFE8E8",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D85D7A",
  },
  details: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#666666",
  },
  button: {
    backgroundColor: "#D85D7A",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});


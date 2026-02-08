import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PatientProfileHeaderProps {
  patientName: string;
  patientPhoto: any;
  sessionType: string;
}

export function PatientProfileHeader({
  patientName,
  patientPhoto,
  sessionType,
}: PatientProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.photoContainer}>
        <Image source={patientPhoto} style={styles.photo} />
        <View style={styles.onlineBadge}>
          <Ionicons name="videocam" size={16} color="#FFFFFF" />
        </View>
      </View>

      <Text style={styles.name}>{patientName}</Text>
      <Text style={styles.sessionType}>{sessionType}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 24,
  },
  photoContainer: {
    position: "relative",
    marginBottom: 16,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F5F5F5",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D85D7A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 4,
  },
  sessionType: {
    fontSize: 14,
    fontWeight: "400",
    color: "#666666",
  },
});

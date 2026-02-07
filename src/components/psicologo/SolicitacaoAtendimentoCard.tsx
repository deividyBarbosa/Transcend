import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { colors } from "@/theme/colors";

interface SolicitacaoAtendimentoCardProps {
  patientName: string;
  patientPhoto: any;
  scheduledTime: string;
  onReject: () => void;
  onAccept: () => void;
}

export function SolicitacaoAtendimentoCard({
  patientName,
  patientPhoto,
  scheduledTime,
  onReject,
  onAccept,
}: SolicitacaoAtendimentoCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={patientPhoto} style={styles.photo} />

        <View style={styles.info}>
          <Text style={styles.name}>{patientName}</Text>
          <Text style={styles.time}>
            Solicita atendimento - {scheduledTime}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={onReject}
          activeOpacity={0.7}
        >
          <Text style={styles.rejectText}>Recusar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={onAccept}
          activeOpacity={0.7}
        >
          <Text style={styles.acceptText}>Aceitar</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  photo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
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
  time: {
    fontSize: 14,
    fontWeight: "400",
    color: "#666666",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#F5E6E8",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B4853",
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#D85D7A",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

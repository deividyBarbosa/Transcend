import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

import { colors } from "@/theme/colors";
import { PatientProfileHeader } from "@/components/psicologo/detalhes-consulta/PatientProfileHeader";
import { ConsultaInfoItem } from "@/components/psicologo/detalhes-consulta/ConsultaInfoItem";
import { NotasSessaoCard } from "@/components/psicologo/detalhes-consulta/NotasSessaoCard";
import { ConfirmDialog } from "@/components/psicologo/detalhes-consulta/ConfirmDialog";

export default function DetalhesConsulta() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");

  const consulta = {
    id: id,
    patientName: "Mariana Silva",
    patientPhoto: require("../../../../assets/avatar-woman.png"),
    sessionType: "Terapia Individual Online",
    date: "24 de Out. 2023",
    time: "14:00 - 15:00",
    meetLink: "meet.google.com/abc-defg-hij",
  };

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleCopyLink = useCallback(async () => {
    await Clipboard.setStringAsync(`https://${consulta.meetLink}`);
    console.log("Link copiado!");
  }, [consulta.meetLink]);

  const handleIniciarConsulta = useCallback(() => {
    console.log("Iniciar consulta");
  }, []);

  const handleCancelarAgendamento = useCallback(() => {
    setShowCancelDialog(true);
  }, []);

  const confirmCancelamento = useCallback(() => {
    setShowCancelDialog(false);
    console.log("Agendamento cancelado");
    router.back();
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Detalhes da Consulta</Text>

        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <PatientProfileHeader
          patientName={consulta.patientName}
          patientPhoto={consulta.patientPhoto}
          sessionType={consulta.sessionType}
        />

        <View style={styles.infoCard}>
          <ConsultaInfoItem
            icon="calendar-outline"
            label="DATA"
            value={consulta.date}
          />

          <View style={styles.divider} />

          <ConsultaInfoItem
            icon="time-outline"
            label="HORÁRIO"
            value={consulta.time}
          />

          <View style={styles.divider} />

          <ConsultaInfoItem
            icon="link-outline"
            label="LINK DA CHAMADA"
            value={consulta.meetLink}
            hasCopyButton
            onCopy={handleCopyLink}
          />
        </View>

        <NotasSessaoCard notes={sessionNotes} onNotesChange={setSessionNotes} />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleIniciarConsulta}
          activeOpacity={0.7}
        >
          <Ionicons name="play" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Iniciar Consulta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleCancelarAgendamento}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={18} color="#666666" />
          <Text style={styles.secondaryButtonText}>Cancelar Agendamento</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmDialog
        visible={showCancelDialog}
        title="Cancelar Agendamento"
        message="Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita."
        confirmText="Sim, cancelar"
        cancelText="Não"
        destructive
        onConfirm={confirmCancelamento}
        onCancel={() => setShowCancelDialog(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 52,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#D85D7A",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: "transparent",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
  },
});
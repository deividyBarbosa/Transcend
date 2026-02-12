import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";

import { colors } from "@/theme/colors";
import { PatientProfileHeader } from "@/components/psicologo/detalhes-consulta/PatientProfileHeader";
import { ConsultaInfoItem } from "@/components/psicologo/detalhes-consulta/ConsultaInfoItem";
import { NotasSessaoCard } from "@/components/psicologo/detalhes-consulta/NotasSessaoCard";
import { ConfirmDialog } from "@/components/psicologo/detalhes-consulta/ConfirmDialog";
import { buscarSessaoPsicologo, DetalhesSessaoPsicologo, responderSolicitacaoPsicologo, atualizarLinkVideochamada } from "@/services/agendamento";
import { supabase } from "@/utils/supabase";

const formatarData = (dateTime: string) => {
  const date = new Date(dateTime);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const extrairHorario = (dateTime: string) => {
  const match = dateTime.match(/(?:T|\s)(\d{2}):(\d{2})/);
  if (!match) return "00:00";
  return `${match[1]}:${match[2]}`;
};

const adicionarMinutos = (time: string, minutes: number) => {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60).toString().padStart(2, "0");
  const mm = (total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
};

export default function DetalhesConsulta() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [carregando, setCarregando] = useState(true);
  const [consulta, setConsulta] = useState<DetalhesSessaoPsicologo | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [cancelando, setCancelando] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [salvandoLink, setSalvandoLink] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;
        if (!userId || !id) {
          setCarregando(false);
          return;
        }

        const sessaoId = Array.isArray(id) ? id[0] : id;
        const resultado = await buscarSessaoPsicologo(sessaoId, userId);
        if (resultado.sucesso && resultado.dados) {
          setConsulta(resultado.dados);
          setSessionNotes(resultado.dados.notas_paciente || "");
        }
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, [id]);

  const handleBackPress = useCallback(() => {
    router.navigate('/psicologo/consultas/consultas');
  }, [router]);

  const handleCopyLink = useCallback(async () => {
    if (!consulta?.link_videochamada) return;
    const link = consulta.link_videochamada.startsWith("http")
      ? consulta.link_videochamada
      : `https://${consulta.link_videochamada}`;
    await Clipboard.setStringAsync(link);
    Alert.alert("Link copiado!");
  }, [consulta?.link_videochamada]);

  const handleIniciarConsulta = useCallback(() => {
    if (!consulta?.link_videochamada) return;
    const link = consulta.link_videochamada.startsWith("http")
      ? consulta.link_videochamada
      : `https://${consulta.link_videochamada}`;
    Linking.openURL(link).catch(() => {
      Alert.alert("Erro", "Não foi possível abrir o link da consulta.");
    });
  }, [consulta?.link_videochamada]);

  const handleAbrirLinkModal = useCallback(() => {
    setLinkInput(consulta?.link_videochamada || "");
    setShowLinkModal(true);
  }, [consulta?.link_videochamada]);

  const handleSalvarLink = useCallback(async () => {
    if (!consulta || !id) return;
    const linkTrimmed = linkInput.trim();
    if (!linkTrimmed) {
      Alert.alert("Atenção", "Insira um link válido.");
      return;
    }

    setSalvandoLink(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return;

      const sessaoId = Array.isArray(id) ? id[0] : id;
      const resultado = await atualizarLinkVideochamada(sessaoId, userId, linkTrimmed);
      if (resultado.sucesso) {
        setConsulta(prev => prev ? { ...prev, link_videochamada: linkTrimmed } : prev);
        setShowLinkModal(false);
        Alert.alert("Sucesso", "Link de videochamada atualizado.");
      } else {
        Alert.alert("Erro", resultado.erro || "Não foi possível salvar o link.");
      }
    } finally {
      setSalvandoLink(false);
    }
  }, [consulta, id, linkInput]);

  const handleCancelarAgendamento = useCallback(() => {
    setShowCancelDialog(true);
  }, []);

  const confirmCancelamento = useCallback(async () => {
    if (!consulta || !id) return;
    setCancelando(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return;

      const sessaoId = Array.isArray(id) ? id[0] : id;
      const resultado = await responderSolicitacaoPsicologo(userId, sessaoId, false);
      if (resultado.sucesso) {
        setShowCancelDialog(false);
        Alert.alert("Sucesso", "Consulta cancelada com sucesso.");
        router.navigate('/psicologo/consultas/consultas');
      } else {
        setShowCancelDialog(false);
        Alert.alert("Erro", resultado.erro || "Não foi possível cancelar a consulta.");
      }
    } finally {
      setCancelando(false);
    }
  }, [consulta, id, router]);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!consulta) {
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
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Consulta não encontrada.</Text>
        </View>
      </View>
    );
  }

  const inicio = extrairHorario(consulta.data_sessao);
  const fim = adicionarMinutos(inicio, consulta.duracao_minutos);
  const modalidadeLabel = consulta.modalidade === "online" ? "Online" : "Presencial";
  const sessionType = `Terapia Individual ${modalidadeLabel}`;

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
          patientName={consulta.paciente_nome}
          patientPhoto={consulta.paciente_foto}
          sessionType={sessionType}
        />

        <View style={styles.infoCard}>
          <ConsultaInfoItem
            icon="calendar-outline"
            label="DATA"
            value={formatarData(consulta.data_sessao)}
          />

          <View style={styles.divider} />

          <ConsultaInfoItem
            icon="time-outline"
            label="HORÁRIO"
            value={`${inicio} - ${fim}`}
          />

          <View style={styles.divider} />
          {consulta.link_videochamada ? (
            <View style={styles.linkRow}>
              <View style={styles.linkItemContainer}>
                <ConsultaInfoItem
                  icon="link-outline"
                  label="LINK DA CHAMADA"
                  value={consulta.link_videochamada}
                  hasCopyButton
                  onCopy={handleCopyLink}
                />
              </View>
              <TouchableOpacity onPress={handleAbrirLinkModal} activeOpacity={0.7} style={styles.editLinkButton}>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addLinkButton} onPress={handleAbrirLinkModal} activeOpacity={0.7}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.addLinkText}>Adicionar link de videochamada</Text>
            </TouchableOpacity>
          )}
        </View>

        <NotasSessaoCard notes={sessionNotes} onNotesChange={setSessionNotes} />

        {consulta.link_videochamada && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleIniciarConsulta}
            activeOpacity={0.7}
          >
            <Ionicons name="play" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Iniciar Consulta</Text>
          </TouchableOpacity>
        )}

        {["agendada", "confirmada", "remarcada"].includes(consulta.status) && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCancelarAgendamento}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={18} color="#666666" />
            <Text style={styles.secondaryButtonText}>Cancelar Agendamento</Text>
          </TouchableOpacity>
        )}
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

      <Modal
        visible={showLinkModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLinkModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {consulta?.link_videochamada ? "Editar link" : "Adicionar link"}
            </Text>
            <Text style={styles.modalSubtitle}>
              Insira o link da videochamada (Google Meet, Zoom, etc.)
            </Text>
            <TextInput
              style={styles.modalInput}
              value={linkInput}
              onChangeText={setLinkInput}
              placeholder="https://meet.google.com/..."
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowLinkModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveButton, salvandoLink && styles.modalSaveButtonDisabled]}
                onPress={handleSalvarLink}
                activeOpacity={0.7}
                disabled={salvandoLink}
              >
                {salvandoLink ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkItemContainer: {
    flex: 1,
  },
  editLinkButton: {
    padding: 8,
    marginRight: 4,
  },
  addLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  addLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: "#F9FAFB",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  modalSaveButtonDisabled: {
    opacity: 0.6,
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

import React, { useCallback, useState } from "react";
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { colors } from "@/theme/colors";
import ErrorMessage from "@/components/ErrorMessage";
import { SolicitacaoAtendimentoCard } from "@/components/psicologo/SolicitacaoAtendimentoCard";
import { supabase } from "@/utils/supabase";
import {
  listarSolicitacoesPsicologo,
  responderSolicitacaoPsicologo,
  type SolicitacaoPsicologoAgenda,
} from "@/services/agendamento";

interface SolicitacaoItem {
  id: string;
  name: string;
  photo: any;
  scheduledTime: string;
}

const formatarDataHora = (dataSessao: string) => {
  const data = new Date(dataSessao);
  return data.toLocaleString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
};

export default function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [respondendoId, setRespondendoId] = useState<string | null>(null);
  const [confirmarRecusaId, setConfirmarRecusaId] = useState<string | null>(null);
  const [erroTela, setErroTela] = useState<string | null>(null);

  const carregarSolicitacoes = useCallback(async () => {
    setIsLoading(true);
    setErroTela(null);
    const { data: auth } = await supabase.auth.getUser();
    const usuarioId = auth.user?.id;

    if (!usuarioId) {
      setSolicitacoes([]);
      setIsLoading(false);
      return;
    }

    const resultado = await listarSolicitacoesPsicologo(usuarioId);
    if (!resultado.sucesso || !resultado.dados) {
      setSolicitacoes([]);
      setIsLoading(false);
      return;
    }

    const lista = (resultado.dados as SolicitacaoPsicologoAgenda[]).map(item => ({
      id: item.id,
      name: item.paciente_nome,
      photo: item.paciente_foto
        ? { uri: item.paciente_foto }
        : require("@/assets/avatar-man.png"),
      scheduledTime: formatarDataHora(item.data_sessao),
    }));

    setSolicitacoes(lista);
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarSolicitacoes();
    }, [carregarSolicitacoes])
  );

  const responder = useCallback(
    async (sessaoId: string, aceitar: boolean) => {
      const { data: auth } = await supabase.auth.getUser();
      const usuarioId = auth.user?.id;

      if (!usuarioId) {
        setErroTela("Usuario nao autenticado.");
        return;
      }

      setRespondendoId(sessaoId);
      setErroTela(null);
      const resultado = await responderSolicitacaoPsicologo(usuarioId, sessaoId, aceitar);
      setRespondendoId(null);

      if (!resultado.sucesso) {
        setErroTela(resultado.erro || "Nao foi possivel responder a solicitacao.");
        return;
      }

      await carregarSolicitacoes();
    },
    [carregarSolicitacoes]
  );

  const handleRecusar = useCallback(
    (sessaoId: string) => {
      setErroTela(null);
      setConfirmarRecusaId(sessaoId);
    },
    []
  );

  const confirmarRecusa = useCallback(async () => {
    if (!confirmarRecusaId) return;
    const sessaoId = confirmarRecusaId;
    setConfirmarRecusaId(null);
    await responder(sessaoId, false);
  }, [confirmarRecusaId, responder]);

  const cancelarRecusa = useCallback(() => {
    setConfirmarRecusaId(null);
  }, []);

  const renderSolicitacaoCard = useCallback(
    ({ item }: { item: SolicitacaoItem }) => (
      <SolicitacaoAtendimentoCard
        patientName={item.name}
        patientPhoto={item.photo}
        scheduledTime={item.scheduledTime}
        onReject={() => handleRecusar(item.id)}
        onAccept={() => responder(item.id, true)}
        disabled={respondendoId === item.id}
      />
    ),
    [handleRecusar, responder, respondendoId]
  );

  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma solicitacao pendente</Text>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: SolicitacaoItem) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Solicitacoes</Text>
        <Text style={styles.subtitle}>{solicitacoes.length} pendente(s)</Text>
        {respondendoId ? <Text style={styles.processingText}>Processando resposta...</Text> : null}
        {confirmarRecusaId ? (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>Deseja recusar esta solicitacao de consulta?</Text>
            <View style={styles.confirmActions}>
              <Text style={styles.confirmCancel} onPress={cancelarRecusa}>
                Cancelar
              </Text>
              <Text style={styles.confirmReject} onPress={confirmarRecusa}>
                Confirmar recusa
              </Text>
            </View>
          </View>
        ) : null}
        <ErrorMessage message={erroTela} />
      </View>

      <FlatList
        data={solicitacoes}
        renderItem={renderSolicitacaoCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "black",
    alignSelf: "center",
  },
  processingText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  confirmBox: {
    marginTop: 10,
    width: "100%",
    backgroundColor: "#FFF7ED",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  confirmText: {
    fontSize: 14,
    color: "#92400E",
    fontWeight: "600",
    marginBottom: 8,
  },
  confirmActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  confirmCancel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  confirmReject: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B91C1C",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  separator: {
    height: 12,
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
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "black",
  },
});

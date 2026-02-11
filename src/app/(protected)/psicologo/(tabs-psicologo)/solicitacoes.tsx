import React, { useCallback, useState } from "react";
import { StyleSheet, View, Text, FlatList, ActivityIndicator, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { colors } from "@/theme/colors";
import { SolicitacaoAtendimentoCard } from "@/components/psicologo/SolicitacaoAtendimentoCard";
import { obterUsuarioAtual } from "@/services/auth";
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
  });
};

export default function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [respondendoId, setRespondendoId] = useState<string | null>(null);

  const carregarSolicitacoes = useCallback(async () => {
    setIsLoading(true);
    const usuario = await obterUsuarioAtual();
    if (!usuario?.id) {
      setSolicitacoes([]);
      setIsLoading(false);
      return;
    }

    const resultado = await listarSolicitacoesPsicologo(usuario.id);
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
      const usuario = await obterUsuarioAtual();
      if (!usuario?.id) {
        Alert.alert("Erro", "Usuario nao autenticado.");
        return;
      }

      setRespondendoId(sessaoId);
      const resultado = await responderSolicitacaoPsicologo(usuario.id, sessaoId, aceitar);
      setRespondendoId(null);

      if (!resultado.sucesso) {
        Alert.alert("Erro", resultado.erro || "Nao foi possivel responder a solicitacao.");
        return;
      }

      await carregarSolicitacoes();
    },
    [carregarSolicitacoes]
  );

  const handleRecusar = useCallback(
    (sessaoId: string) => {
      Alert.alert("Recusar solicitacao", "Deseja recusar esta solicitacao de consulta?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Recusar",
          style: "destructive",
          onPress: () => responder(sessaoId, false),
        },
      ]);
    },
    [responder]
  );

  const renderSolicitacaoCard = useCallback(
    ({ item }: { item: SolicitacaoItem }) => (
      <SolicitacaoAtendimentoCard
        patientName={item.name}
        patientPhoto={item.photo}
        scheduledTime={item.scheduledTime}
        onReject={() => handleRecusar(item.id)}
        onAccept={() => responder(item.id, true)}
      />
    ),
    [handleRecusar, responder]
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

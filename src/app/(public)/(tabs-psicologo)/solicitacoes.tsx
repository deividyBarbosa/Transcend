import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import { colors } from "@/theme/colors";
import { SolicitacaoAtendimentoCard } from "@/components/psicologo/SolicitacaoAtendimentoCard";

interface Solicitacao {
  id: string;
  name: string;
  photo: any;
  scheduledTime: string;
   
}

// dados mockados p dps vcs pegarem da api
const MOCK_PACIENTES: Solicitacao[] = [
  {
    id: "1",
    name: "Jorge Pietro",
    photo: require("../../../assets/avatar-man.png"),
    scheduledTime: "quarta-feira às 17h30",
  },
  {
    id: "2",
    name: "Priscila Lima",
    photo: require("../../../assets/avatar-woman.png"),
    scheduledTime: "quarta-feira às 18h30",
  },
];

export default function Solicitacoes() {
  const router = useRouter();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(MOCK_PACIENTES);
  const [isLoading, setIsLoading] = useState(false);


  const handleSolicitacaoPress = useCallback(
    (pacienteId: string) => {
      router.push(`/paciente/${pacienteId}`);
    },
    [router],
  );

  const renderSolicitacaoCard = useCallback(
    ({ item }: { item: Solicitacao }) => (
      <SolicitacaoAtendimentoCard
        patientName={item.name}
        patientPhoto={item.photo}
        scheduledTime={item.scheduledTime}
        onReject={() => console.log("Solicitação recusada")}
        onAccept={() => console.log("Solicitação aceita")}
      />
    ),
    [handleSolicitacaoPress],
  );

  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma solicitação pendente</Text>
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: Solicitacao) => item.id, []);

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
        <Text style={styles.title}>Pacientes</Text>
        <Text style={styles.subtitle}>{solicitacoes.length} paciente(s)</Text>
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
    alignSelf: "center",
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

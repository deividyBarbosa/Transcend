import React, { useState, useCallback } from "react";
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { colors } from "@/theme/colors";
import { PacienteCard } from "@/components/psicologo/PacienteCard";
import { obterUsuarioAtual } from "@/services/auth";
import { listarPacientesPsicologo, type PacientePsicologoAgenda } from "@/services/agendamento";

interface Paciente {
  id: string;
  name: string;
  age: number | null;
  photo: any;
}

const calcularIdade = (dataNascimento: string | null) => {
  if (!dataNascimento) return null;
  const nascimento = new Date(dataNascimento);
  if (Number.isNaN(nascimento.getTime())) return null;

  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesDiff = hoje.getMonth() - nascimento.getMonth();
  if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade >= 0 ? idade : null;
};

export default function Pacientes() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const carregarPacientes = useCallback(async () => {
    setIsLoading(true);
    const usuario = await obterUsuarioAtual();
    if (!usuario?.id) {
      setPacientes([]);
      setIsLoading(false);
      return;
    }

    const resultado = await listarPacientesPsicologo(usuario.id);
    if (!resultado.sucesso || !resultado.dados) {
      setPacientes([]);
      setIsLoading(false);
      return;
    }

    const lista = (resultado.dados as PacientePsicologoAgenda[]).map(item => ({
      id: item.paciente_id,
      name: item.nome,
      age: calcularIdade(item.data_nascimento),
      photo: item.foto_url ? { uri: item.foto_url } : require("@/assets/avatar-man.png"),
    }));

    setPacientes(lista);
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarPacientes();
    }, [carregarPacientes])
  );

  const handlePacientePress = useCallback(
    (pacienteId: string) => {
      router.push(`/paciente/${pacienteId}`);
    },
    [router]
  );

  const renderPacienteCard = useCallback(
    ({ item }: { item: Paciente }) => (
      <PacienteCard
        pacientId={item.id}
        pacientName={item.name}
        pacientAge={item.age}
        pacientPhoto={item.photo}
        onPress={() => handlePacientePress(item.id)}
      />
    ),
    [handlePacientePress]
  );

  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum paciente confirmado ainda</Text>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: Paciente) => item.id, []);

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
        <Text style={styles.subtitle}>{pacientes.length} paciente(s)</Text>
      </View>

      <FlatList
        data={pacientes}
        renderItem={renderPacienteCard}
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

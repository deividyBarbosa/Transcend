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
import { PacienteCard } from "@/components/psicologo/PacienteCard";

interface Paciente {
  id: string;
  name: string;
  age: number;
  photo: any; 
}

// dados mockados p dps vcs pegarem da api
const MOCK_PACIENTES: Paciente[] = [
  {
    id: "1",
    name: "Mario Cururu",
    age: 24,
    photo: require("../../../assets/avatar-man.png"),
  },
  {
    id: "2", 
    name: "Ana Mary",
    age: 16,
    photo: require("../../../assets/avatar-woman.png"),
  },
];

export default function Pacientes() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>(MOCK_PACIENTES);
  const [isLoading, setIsLoading] = useState(false);


  const handlePacientePress = useCallback(
    (pacienteId: string) => {
      router.push(`/paciente/${pacienteId}`);
    },
    [router],
  );

  const renderPacienteCard = useCallback(
    ({ item }: { item: Paciente }) => (
      <PacienteCard
        pacientName={item.name}
        pacientAge={item.age}
        pacientPhoto={item.photo}
        onPress={() => handlePacientePress(item.id)}
      />
    ),
    [handlePacientePress],
  );

  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum paciente cadastrado</Text>
      </View>
    ),
    [],
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

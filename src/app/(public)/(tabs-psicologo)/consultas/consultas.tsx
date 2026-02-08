import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import { AgendamentoCard } from "@/components/psicologo/AgendamentoCard";

type TabType = "proximas" | "passadas" | "canceladas";

interface Consulta {
  id: string;
  patientName: string;
  patientPhoto: any;
  sessionType: string;
  date: string;
  time: string;
  badge?: "HOJE" | "AMANHÃ" | null;
}

const MOCK_CONSULTAS_PROXIMAS: Consulta[] = [
  {
    id: "1",
    patientName: "Mariana Silva",
    patientPhoto: require("../../../../assets/avatar-woman.png"),
    sessionType: "Online • Terapia Individual",
    date: "24 de Fev. 2026",
    time: "14:00 - 15:00",
    badge: "HOJE",
  },
  {
    id: "2",
    patientName: "Ricardo Santos",
    patientPhoto: require("../../../../assets/avatar-man.png"),
    sessionType: "Presencial • Terapia Individual",
    date: "25 de Fev. 2026",
    time: "09:30 - 10:30",
    badge: null,
  },
  
];

const MOCK_CONSULTAS_PASSADAS: Consulta[] = [{
    id: "3",
    patientName: "Ana Ferreira",
    patientPhoto: require("../../../../assets/avatar-woman.png"),
    sessionType: "Online • Primeira Consulta",
    date: "28 de Jan. 2026",
    time: "16:00 - 17:00",
    badge: null,
  },];
const MOCK_CONSULTAS_CANCELADAS: Consulta[] = [];

export default function Consultas() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("proximas");
  const [isLoading, setIsLoading] = useState(false);

  const getConsultasByTab = useCallback(() => {
    switch (activeTab) {
      case "proximas":
        return MOCK_CONSULTAS_PROXIMAS;
      case "passadas":
        return MOCK_CONSULTAS_PASSADAS;
      case "canceladas":
        return MOCK_CONSULTAS_CANCELADAS;
      default:
        return [];
    }
  }, [activeTab]);

  const consultas = getConsultasByTab();

  //usar isso em vez do mock, pra ir pro id do paciente 
  const handleConsultaPress = useCallback(
    (consultaId: string) => {
      router.push(`/consulta/${consultaId}`); 
    },
    [router],
  );

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const renderConsultaCard = useCallback(
    ({ item }: { item: Consulta }) => (
      <AgendamentoCard
        patientName={item.patientName}
        patientPhoto={item.patientPhoto}
        sessionType={item.sessionType}
        date={item.date}
        time={item.time}
        badge={item.badge}
        onPress={() => router.push("./detalhes-consulta")}
        // onPress={() => handleConsultaPress(item.id)} TODO: Quando integrar lembre de colocar isso em vez do mock
      />
    ),
    [handleConsultaPress],
  );

  const renderEmptyList = useCallback(() => {
    const emptyMessages = {
      proximas: "Nenhuma consulta próxima",
      passadas: "Nenhuma consulta passada",
      canceladas: "Nenhuma consulta cancelada",
    };

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessages[activeTab]}</Text>
      </View>
    );
  }, [activeTab]);

  const keyExtractor = useCallback((item: Consulta) => item.id, []);

  const renderTabButton = useCallback(
    (tab: TabType, label: string) => (
      <TouchableOpacity
        key={tab}
        style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
        onPress={() => setActiveTab(tab)}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    ),
    [activeTab],
  );

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Minhas Consultas</Text>

        <View style={styles.backButton} />
      </View>

      <View style={styles.tabsContainer}>
        {renderTabButton("proximas", "Próximas")}
        {renderTabButton("passadas", "Passadas")}
        {renderTabButton("canceladas", "Canceladas")}
      </View>

      <FlatList
        data={consultas}
        renderItem={renderConsultaCard}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  tabButtonActive: {
    backgroundColor: "#FFE8E8",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#999999",
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D85D7A",
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
    color: "#666666",
  },
});

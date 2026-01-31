import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import { ProfilePhoto } from "@/components/psicologo/ProfilePicture";

interface Perfil {
  id: string;
  nome: string;
  foto: any;
  crp: string;
  titulo: string;
  descricao: string;
  especialidades: string[];
  estatisticas: {
    pacientes: number;
    avaliacao: number;
    experiencia: number;
  };
}

const MOCK_PERFIL: Perfil = {
  id: "1",
  nome: "Dra. Mariana Silva",
  foto: require("../../../assets/avatar-woman.png"),
  crp: "CRP 06/123456",
  titulo: "PSICÓLOGA CLÍNICA",
  descricao:
    "Psicóloga com atuação clínica voltada ao acompanhamento de pessoas trans, travestis e não binárias em diferentes etapas da transição de gênero. Trabalho focado no acolhimento, fortalecimento da identidade, manejo de ansiedade, depressão e estresse social, além de suporte psicológico durante processos de transição social, familiar, médica e jurídica. Atendimento pautado na escuta ética, respeito à diversidade e promoção da saúde mental em contextos de vulnerabilidade e afirmação de gênero.",
  especialidades: [
    "Psicologia afirmativa de gênero",
    "Pessoas trans e não binárias",
    "Acompanhamento psicológico na transição",
    "Saúde mental LGBTQIAPN+",
    "Autoconhecimento",
  ],
  estatisticas: {
    pacientes: 120,
    avaliacao: 4.9,
    experiencia: 8,
  },
};

export default function PerfilPsicologo() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil>(MOCK_PERFIL);

  const handleEditPhoto = useCallback(() => {
    Alert.alert(
      "Alterar foto",
      "Escolha uma opção",
      [
        {
          text: "Câmera",
          onPress: () => console.log("Abrir câmera"),
        },
        {
          text: "Galeria",
          onPress: () => console.log("Abrir galeria"),
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ],
      { cancelable: true },
    );
  }, []);

  const handleEditProfile = useCallback(() => {
    router.push("/editar-perfil");
  }, [router]);

  const handleSettings = useCallback(() => {
    router.push("/configuracoes");
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#3D2B2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity style={styles.menuButton} onPress={handleSettings}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#3D2B2E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.photoSection}>
          <ProfilePhoto
            source={perfil.foto}
            size={120}
            onEditPress={handleEditPhoto}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.nome}>{perfil.nome}</Text>
          <Text style={styles.titulo}>
            {perfil.titulo} | {perfil.crp}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {perfil.estatisticas.pacientes}+
            </Text>
            <Text style={styles.statLabel}>PACIENTES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.ratingContainer}>
              <Text style={styles.statValue}>
                {perfil.estatisticas.avaliacao}
              </Text>
              <Ionicons name="star" size={20} color="#FFA500" />
            </View>
            <Text style={styles.statLabel}>AVALIAÇÕES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {perfil.estatisticas.experiencia} anos
            </Text>
            <Text style={styles.statLabel}>EXPERIÊNCIA</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre mim</Text>
          <Text style={styles.descricao}>{perfil.descricao}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Especialidades</Text>
          <View style={styles.tagsContainer}>
            {perfil.especialidades.map((especialidade, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{especialidade}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettings}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={20} color="#D65C73" />
            <Text style={styles.settingsButtonText}>Configurações</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3D2B2E",
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  photoSection: {
    paddingVertical: 24,
    alignItems: "center",
  },
  infoSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  nome: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3D2B2E",
    marginBottom: 4,
  },
  titulo: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D65C73",
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginHorizontal: 24,
    backgroundColor: "#FFF5F7",
    borderRadius: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3D2B2E",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#F3E8EB",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3D2B2E",
    marginBottom: 12,
  },
  descricao: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6B7280",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF5F7",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FECDD3",
  },
  tagText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#D65C73",
  },
  buttonsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#D65C73",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#EC4899",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D65C73",
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D65C73",
  },
});

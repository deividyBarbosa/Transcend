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
import { ProfileStats } from "@/components/psicologo/ProfileStats";

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
  nome: "Dra. Valéria Almeida",
  foto: require("../../../assets/val-almeida.png"),
  crp: "CRP 06/123456",
  titulo: "PSICÓLOGA CLÍNICA",
  descricao:
    "Psicóloga com atuação clínica voltada ao acompanhamento de pessoas trans, travestis e não binárias em diferentes etapas da transição de gênero. Trabalho focada no acolhimento, fortalecimento da identidade, manejo de ansiedade, depressão e estresse social, além de suporte psicológico durante processos de transição social, familiar, médica e jurídica. Atendimento pautado na escuta ética, respeito à diversidade e promoção da saúde mental em contextos de vulnerabilidade e afirmação de gênero.",
  especialidades: [
    "Pessoas trans e não binárias",
    "Saúde mental LGBTQIAPN+",
    "Transição de gênero",
    "Processos de afirmação de gênero",
    "Autoconhecimento",
  ],
  estatisticas: {
    pacientes: 120, //todo: tratar pra aparecer mensagem caso nao tenha ou nao tenha informado em editar perfil
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
          <Ionicons name="arrow-back" size={24} color="#D65C73" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity style={styles.menuButton} onPress={handleSettings}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#D65C73" />
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

        <ProfileStats
          pacientes={perfil.estatisticas.pacientes}
          avaliacao={perfil.estatisticas.avaliacao}
          experiencia={perfil.estatisticas.experiencia}
        />

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
    backgroundColor: colors.background,
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
    shadowColor: "#D65C73",
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

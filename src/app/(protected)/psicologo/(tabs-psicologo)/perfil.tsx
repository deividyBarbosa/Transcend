import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import { ProfilePhoto } from "@/components/psicologo/ProfilePicture";
import { ProfileStats } from "@/components/psicologo/ProfileStats";
import { fazerLogout, obterUsuarioAtual } from "@/services/auth";
import {
  buscarMeuPerfilPsicologo,
  PerfilPsicologoData,
} from "@/services/psicologo";

export default function PerfilPsicologo() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilPsicologoData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarPerfil = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    const usuario = await obterUsuarioAtual();
    if (!usuario) {
      setErro("Não foi possível identificar o usuário logado.");
      setCarregando(false);
      return;
    }

    const resultado = await buscarMeuPerfilPsicologo(usuario.id);

    if (resultado.sucesso && resultado.dados) {
      setPerfil(resultado.dados);
    } else {
      setErro(resultado.erro || "Erro ao carregar perfil.");
    }

    setCarregando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [carregarPerfil])
  );
  const handleEditProfile = useCallback(() => {
    router.push("/editar-perfil");
  }, [router]);

  const handleSettings = useCallback(() => {
    router.push("/configuracoes");
  }, [router]);

  const handleDisponibilidade = useCallback(() => {
    router.push("/psicologo/disponibilidade");
  }, [router]);

  const handleSair = useCallback(() => {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            const resultado = await fazerLogout();
            if (resultado.sucesso) {
              router.replace("/");
            } else {
              Alert.alert("Erro", resultado.erro || "Não foi possível sair.");
            }
          },
        },
      ]
    );
  }, [router]);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (erro || !perfil) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.primary} />
        <Text style={styles.erroTexto}>{erro || "Perfil não encontrado."}</Text>
        <TouchableOpacity style={styles.tentarNovamenteBotao} onPress={carregarPerfil}>
          <Text style={styles.tentarNovamenteTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fotoSource = perfil.foto_url
    ? { uri: perfil.foto_url }
    : require("@/assets/val-almeida.png");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.photoSection}>
          <ProfilePhoto
            source={fotoSource}
            size={120}
            editable={false}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.nome}>{perfil.nome}</Text>
          <Text style={styles.titulo}>
            {perfil.titulo ? `${perfil.titulo} | ` : ""}{perfil.crp}
          </Text>
        </View>

        <ProfileStats
          pacientes={perfil.total_pacientes ?? 0}
          experiencia={perfil.anos_experiencia ?? 0}
        />

        {perfil.descricao ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre mim</Text>
            <Text style={styles.descricao}>{perfil.descricao}</Text>
          </View>
        ) : null}

        {perfil.especialidades && perfil.especialidades.length > 0 ? (
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
        ) : null}

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
            <Ionicons name="settings-outline" size={20} color={colors.primary} />
            <Text style={styles.settingsButtonText}>Configurações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleDisponibilidade}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.settingsButtonText}>Disponibilidade</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleSair}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#F44336" />
            <Text style={styles.logoutButtonText}>Sair da conta</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  erroTexto: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  tentarNovamenteBotao: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  tentarNovamenteTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    position: "relative", 
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 16, // Adicione isso
    zIndex: 1, // Adicione isso
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3D2B2E",
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "space-between",
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F44336",
  },
});




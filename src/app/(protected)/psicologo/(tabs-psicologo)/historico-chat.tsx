import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { RealtimeChannel } from "@supabase/supabase-js";

import { colors } from "@/theme/colors";
import { PacienteChatCard } from "@/components/psicologo/PacienteChatCard";
import { SearchInput } from "@/components/Input/SearchInput";
import { obterUsuarioAtual } from "@/services/auth";
import {
  buscarConversasPsicologo,
  escutarConversas,
  pararEscuta,
} from "@/services/chat";
import { ConversaHistorico, Conversa } from "@/types/chat";

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MESES_CURTOS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatarHorario(dataISO: string | null): string {
  if (!dataISO) return "";

  const data = new Date(dataISO);
  const agora = new Date();

  const diffMs = agora.getTime() - data.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Mesmo dia — mostra hora
  if (
    data.getDate() === agora.getDate() &&
    data.getMonth() === agora.getMonth() &&
    data.getFullYear() === agora.getFullYear()
  ) {
    return `${data.getHours().toString().padStart(2, "0")}:${data.getMinutes().toString().padStart(2, "0")}`;
  }

  // Ontem
  if (diffDias === 1) return "Ontem";

  // Dentro da mesma semana
  if (diffDias < 7) return DIAS_SEMANA[data.getDay()];

  // Mais antigo — dia e mês
  return `${data.getDate()} ${MESES_CURTOS[data.getMonth()]}`;
}

export default function HistoricoChat() {
  const router = useRouter();
  const [conversas, setConversas] = useState<ConversaHistorico[]>([]);
  const [conversasFiltradas, setConversasFiltradas] = useState<ConversaHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const carregarConversas = useCallback(async (idUsuario: string) => {
    setCarregando(true);
    try {
      const resultado = await buscarConversasPsicologo(idUsuario);

      if (resultado.sucesso && resultado.dados) {
        setConversas(resultado.dados);
        setConversasFiltradas(resultado.dados);
        if (resultado.dados.length > 0 && !activeChatId) {
          setActiveChatId(resultado.dados[0].conversa_id);
        }
      } else {
        console.error("Erro ao carregar conversas:", resultado.erro);
        Alert.alert("Erro", resultado.erro ?? "Não foi possível carregar as conversas");
      }
    } catch (error) {
      console.error("Erro ao buscar chats:", error);
    } finally {
      setCarregando(false);
    }
  }, [activeChatId]);

  useEffect(() => {
    let montado = true;

    async function inicializar() {
      const usuario = await obterUsuarioAtual();
      if (!montado || !usuario) return;

      setUsuarioId(usuario.id);
      await carregarConversas(usuario.id);

      // Escutar atualizações em tempo real
      channelRef.current = escutarConversas(usuario.id, (conversaAtualizada: Conversa) => {
        setConversas((prev) => {
          const atualizadas = prev.map((c) =>
            c.conversa_id === conversaAtualizada.id
              ? {
                  ...c,
                  ultima_mensagem_em: conversaAtualizada.ultima_mensagem_em,
                  ultima_mensagem_preview: conversaAtualizada.ultima_mensagem_preview,
                  mensagens_nao_lidas: conversaAtualizada.mensagens_nao_lidas_psicologo ?? 0,
                }
              : c,
          );
          // Reordenar por última mensagem
          atualizadas.sort((a, b) => {
            if (!a.ultima_mensagem_em) return 1;
            if (!b.ultima_mensagem_em) return -1;
            return new Date(b.ultima_mensagem_em).getTime() - new Date(a.ultima_mensagem_em).getTime();
          });
          return atualizadas;
        });
      });
    }

    inicializar();

    return () => {
      montado = false;
      if (channelRef.current) {
        pararEscuta(channelRef.current);
      }
    };
  }, []);

  // Sincronizar conversasFiltradas quando conversas mudam
  useEffect(() => {
    if (searchText.trim() === "") {
      setConversasFiltradas(conversas);
    } else {
      const filtradas = conversas.filter((c) =>
        c.nome_participante.toLowerCase().includes(searchText.toLowerCase()),
      );
      setConversasFiltradas(filtradas);
    }
  }, [conversas, searchText]);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleRefresh = useCallback(async () => {
    if (usuarioId) {
      await carregarConversas(usuarioId);
    }
  }, [usuarioId, carregarConversas]);

  const handleChatPress = useCallback(
    (conversaId: string, pacienteId: string) => {
      setActiveChatId(conversaId);
      router.push(`/paciente-chat/${pacienteId}`);
    },
    [router],
  );

  const renderChatCard = useCallback(
    ({ item }: { item: ConversaHistorico }) => (
      <PacienteChatCard
        pacientId={item.paciente_id}
        pacientName={item.nome_participante}
        pacientPhoto={item.foto_participante}
        lastMessage={item.ultima_mensagem_preview ?? ""}
        lastMessageTime={formatarHorario(item.ultima_mensagem_em)}
        unreadCount={item.mensagens_nao_lidas}
        isActive={activeChatId === item.conversa_id}
        onPress={() => handleChatPress(item.conversa_id, item.paciente_id)}
      />
    ),
    [handleChatPress, activeChatId],
  );

  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color="#D1667A40" />
        <Text style={styles.emptyTitle}>
          {searchText ? "Nenhum chat encontrado" : "Nenhuma conversa ainda"}
        </Text>
        <Text style={styles.emptySubtitle}>
          {searchText
            ? "Tente buscar por outro nome"
            : "Suas conversas com pacientes aparecerão aqui"}
        </Text>
      </View>
    ),
    [searchText],
  );

  const getTotalNaoLidas = useCallback(() => {
    return conversas.reduce((soma: number, c: ConversaHistorico) => soma + c.mensagens_nao_lidas, 0);
  }, [conversas]);

  const keyExtractor = useCallback((item: ConversaHistorico) => item.conversa_id, []);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando conversas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/home-psicologo")}
          >
            <Ionicons name="arrow-back" size={22} color="#D1667A" />
          </TouchableOpacity>
          <Text style={styles.title}>Histórico de Chats</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.searchWrapper}>
          <SearchInput
            value={searchText}
            onChangeText={handleSearch}
            placeholder="Buscar paciente..."
          />
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {conversasFiltradas.length} conversa(s)
          </Text>
          {getTotalNaoLidas() > 0 && (
            <>
              <View style={styles.statsDot} />
              <Text style={styles.statsUnread}>
                {getTotalNaoLidas()} não lida(s)
              </Text>
            </>
          )}
        </View>
      </View>

      <FlatList
        data={conversasFiltradas}
        renderItem={renderChatCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        onRefresh={handleRefresh}
        refreshing={carregando}
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3D2B2E",
  },
  searchWrapper: {
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  statsDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1667A",
    marginHorizontal: 8,
  },
  statsUnread: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D1667A",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F0F1",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3D2B2E",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

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
import { PacienteChatCard } from "@/components/psicologo/PacienteChatCard";
import { SearchInput } from "@/components/Input/SearchInput";

interface Chat {
  id: string;
  paciente: {
    id: string;
    nome: string;
    foto: any;
  };
  ultimaMensagem: {
    texto: string;
    horario: string;
  };
  naoLidas: number;
}

const MOCK_CHATS: Chat[] = [
  {
    id: "1",
    paciente: {
      id: "p1",
      nome: "Sophia Duarte",
      foto: require("../../../assets/avatar-woman.png"),
    },
    ultimaMensagem: {
      texto: "Obrigada pela sessão de hoje, me senti bem melhor.",
      horario: "10:45",
    },
    naoLidas: 2,
  },
  {
    id: "2",
    paciente: {
      id: "p2",
      nome: "Alex Moreno",
      foto: require("../../../assets/avatar-man.png"),
    },
    ultimaMensagem: {
      texto: "Podemos remarcar para quinta-feira?",
      horario: "Ontem",
    },
    naoLidas: 0,
  },
  {
    id: "3",
    paciente: {
      id: "p3",
      nome: "Lucas Ribeiro",
      foto: require("../../../assets/avatar-man.png"),
    },
    ultimaMensagem: {
      texto: "Já realizei o pagamento da mensalidade.",
      horario: "Terça",
    },
    naoLidas: 0,
  },
  {
    id: "4",
    paciente: {
      id: "p4",
      nome: "Beatriz Silva",
      foto: require("../../../assets/avatar-woman.png"),
    },
    ultimaMensagem: {
      texto: "Até a próxima semana, doutora!",
      horario: "22 Jan",
    },
    naoLidas: 0,
  },
  {
    id: "5",
    paciente: {
      id: "p5",
      nome: "Gabriel Santos",
      foto: require("../../../assets/avatar-man.png"),
    },
    ultimaMensagem: {
      texto: "Você enviou um arquivo.",
      horario: "15 Jan",
    },
    naoLidas: 0,
  },
  {
    id: "6",
    paciente: {
      id: "p6",
      nome: "Mariana Lima",
      foto: require("../../../assets/avatar-woman.png"),
    },
    ultimaMensagem: {
      texto: "Obrigado pela indicação do livro.",
      horario: "10 Jan",
    },
    naoLidas: 0,
  },
];

export default function HistoricoChat() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [filteredChats, setFilteredChats] = useState<Chat[]>(MOCK_CHATS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>("1");

  const fetchChats = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setChats(MOCK_CHATS);
      setFilteredChats(MOCK_CHATS);
    } catch (error) {
      console.error("Erro ao buscar chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchText(text);

      if (text.trim() === "") {
        setFilteredChats(chats);
        return;
      }

      const filtered = chats.filter((chat) =>
        chat.paciente.nome.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredChats(filtered);
    },
    [chats],
  );

  const handleChatPress = useCallback(
    (chatId: string, pacienteId: string) => {
      setActiveChatId(chatId);
      router.push(`/paciente-chat/${pacienteId}`);
    },
    [router],
  );

  const renderChatCard = useCallback(
    ({ item }: { item: Chat }) => (
      <PacienteChatCard
        pacientId={item.paciente.id}
        pacientName={item.paciente.nome}
        pacientPhoto={item.paciente.foto}
        lastMessage={item.ultimaMensagem.texto}
        lastMessageTime={item.ultimaMensagem.horario}
        unreadCount={item.naoLidas}
        isActive={activeChatId === item.id}
        onPress={() => handleChatPress(item.id, item.paciente.id)}
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

  const getTotalUnread = useCallback(() => {
    return chats.reduce((sum, chat) => sum + chat.naoLidas, 0);
  }, [chats]);

  const keyExtractor = useCallback((item: Chat) => item.id, []);

  if (isLoading) {
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
            {filteredChats.length} conversa(s)
          </Text>
          {getTotalUnread() > 0 && (
            <>
              <View style={styles.statsDot} />
              <Text style={styles.statsUnread}>
                {getTotalUnread()} não lida(s)
              </Text>
            </>
          )}
        </View>
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderChatCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        onRefresh={fetchChats}
        refreshing={isLoading}
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
    backgroundColor: "#F8F0F1",
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
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#D1667A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
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

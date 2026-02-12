import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ChatHeader from "@/components/chat/ChatHeader";
import MensagemBubble from "@/components/chat/MensagemBubble";
import ChatInput from "@/components/chat/ChatInput";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";

type Mensagem = {
  id: string;
  remetenteId: string;
  remetenteTipo: "psicologo" | "paciente";
  conteudo: string;
  timestamp: string;
  lida: boolean;
  tipo: "texto";
};

// Mensagens mockadas para Maria Silva
const MENSAGENS_MOCK: Mensagem[] = [
  {
    id: "1",
    remetenteId: "mock-paciente-456",
    remetenteTipo: "paciente",
    conteudo: "Olá! Gostaria de marcar uma sessão para esta semana.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    lida: true,
    tipo: "texto",
  },
  {
    id: "2",
    remetenteId: "psicologo-atual",
    remetenteTipo: "psicologo",
    conteudo:
      "Olá, Maria! Claro, tenho disponibilidade na quinta-feira às 14h ou na sexta às 10h. Qual horário funciona melhor para você?",
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    lida: true,
    tipo: "texto",
  },
  {
    id: "3",
    remetenteId: "mock-paciente-456",
    remetenteTipo: "paciente",
    conteudo: "Quinta-feira às 14h seria perfeito!",
    timestamp: new Date(Date.now() - 2400000).toISOString(),
    lida: true,
    tipo: "texto",
  },
  {
    id: "4",
    remetenteId: "psicologo-atual",
    remetenteTipo: "psicologo",
    conteudo:
      "Ótimo! Já confirmei a sessão para quinta-feira, 14h. Nos vemos lá! 😊",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    lida: true,
    tipo: "texto",
  },
  {
    id: "5",
    remetenteId: "mock-paciente-456",
    remetenteTipo: "paciente",
    conteudo: "Obrigada pela sessão de hoje, foi muito esclarecedora!",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    lida: false,
    tipo: "texto",
  },
];

export default function ChatMock() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [mensagens, setMensagens] = useState<Mensagem[]>(MENSAGENS_MOCK);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleEnviar = () => {
    if (!inputText.trim()) return;

    const novaMensagem: Mensagem = {
      id: Date.now().toString(),
      remetenteId: "psicologo-atual",
      remetenteTipo: "psicologo",
      conteudo: inputText.trim(),
      timestamp: new Date().toISOString(),
      lida: true,
      tipo: "texto",
    };

    setMensagens([...mensagens, novaMensagem]);
    setInputText("");

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ChatHeader
          nome="Maria Silva"
          foto={require("@/assets/avatar-man.png")}
          onBack={() => router.back()}
        />

        <FlatList
          ref={flatListRef}
          data={mensagens}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MensagemBubble
              mensagem={item}
              isMinha={item.remetenteTipo === "psicologo"}
              avatarUrl={
                item.remetenteTipo === "paciente" ? undefined : undefined
              }
            />
          )}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.mensagensList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        <ChatInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleEnviar}
          onFocus={() => {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 500);
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mensagensList: {
    padding: 16,
    paddingBottom: 8,
  },
});

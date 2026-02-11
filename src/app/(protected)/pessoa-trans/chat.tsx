// to-do: remover o que não uso mais do anexo de pdf e imagens

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ChatHeader from '@/components/chat/ChatHeader';
import MensagemBubble from '@/components/chat/MensagemBubble';
import ChatInput from '@/components/chat/ChatInput';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { MENSAGENS_MOCK, CONVERSAS_MOCK, type Mensagem } from '@/mocks/mockChat';


export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const conversaId = params.conversaId as string;
  const flatListRef = useRef<FlatList>(null);

  const conversa = CONVERSAS_MOCK.find(c => c.id === conversaId);
  const [mensagens, setMensagens] = useState<Mensagem[]>(MENSAGENS_MOCK[conversaId] || []);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  if (!conversa) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Conversa não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleEnviar = () => {
    if (!inputText.trim()) return;

    const novaMensagem: Mensagem = {
      id: Date.now().toString(),
      remetenteId: 'paciente',
      remetenteTipo: 'paciente',
      conteudo: inputText.trim(),
      timestamp: new Date().toISOString(),
      lida: true,
      tipo: 'texto',
    };

    setMensagens([...mensagens, novaMensagem]);
    setInputText('');

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
          nome={conversa.psicologoNome}
          foto={require("@/assets/avatar-woman.png")}
          onBack={() => router.back()}
        />

        <FlatList
          ref={flatListRef}
          data={mensagens}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MensagemBubble
              mensagem={item}
              isMinha={item.remetenteTipo === "paciente"}
              avatarUrl={
                item.remetenteTipo === "psicologo"
                  ? conversa.psicologoFoto
                  : undefined
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.muted,
  },
});
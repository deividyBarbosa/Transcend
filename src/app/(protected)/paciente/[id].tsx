import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { supabase } from '@/utils/supabase';
import { buscarOuCriarConversa } from '@/services/chat';
import { obterUsuarioAtual } from '@/services/auth';

export default function PacienteScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const pacienteId = id as string;

  const [perfil, setPerfil] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', pacienteId)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar perfil do paciente:', error);
        } else if (mounted) {
          setPerfil(data || null);
        }
      } catch (e) {
        console.error('Erro inesperado ao buscar perfil:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pacienteId]);

  const handleStartChat = useCallback(async () => {
    setStartingChat(true);
    try {
      const usuario = await obterUsuarioAtual();
      if (!usuario) {
        console.warn('Usuário não autenticado');
        return;
      }

      const resultado = await buscarOuCriarConversa(pacienteId, usuario.id);
      if (resultado.sucesso && resultado.dados) {
        const conversaId = (resultado.dados as any).id;
        router.push(`/pessoa-trans/chat?conversaId=${conversaId}`);
      } else {
        console.error('Erro ao iniciar conversa:', resultado.erro);
      }
    } catch (e) {
      console.error('Erro ao iniciar chat:', e);
    } finally {
      setStartingChat(false);
    }
  }, [pacienteId, router]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!perfil) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Paciente não encontrado</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {perfil.foto_url ? (
        <Image source={{ uri: perfil.foto_url }} style={styles.avatar} />
      ) : null}

      <Text style={styles.title}>{perfil.nome}</Text>
      <Text style={styles.subtitle}>{perfil.email}</Text>

      <TouchableOpacity style={styles.button} onPress={handleStartChat} disabled={startingChat}>
        <Text style={styles.buttonText}>{startingChat ? 'Abrindo chat...' : 'Iniciar Chat'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondary]} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitle: { marginTop: 8, color: '#6B7280' },
  button: { marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  secondary: { backgroundColor: '#888' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

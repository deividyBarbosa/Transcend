import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { supabase } from '@/utils/supabase';
import { obterUsuarioAtual } from '@/services/auth';
import { buscarOuCriarConversa } from '@/services/chat';

export default function PacienteChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const pacienteId = id as string;

  const [paciente, setPaciente] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('perfis').select('*').eq('id', pacienteId).maybeSingle();
        if (mounted) setPaciente(data || null);
      } catch (e) {
        console.error('Erro ao buscar paciente:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [pacienteId]);

  const handleOpenChat = async () => {
    setStarting(true);
    try {
      const usuario = await obterUsuarioAtual();
      if (!usuario) throw new Error('Usuário não autenticado');

      const resultado = await buscarOuCriarConversa(pacienteId, usuario.id);
      if (resultado.sucesso && resultado.dados) {
        router.push(`/pessoa-trans/chat?conversaId=${(resultado.dados as any).id}`);
      } else {
        console.error('Erro ao obter/ criar conversa:', resultado.erro);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStarting(false);
    }
  };

  if (loading) return (
    <View style={styles.container}><ActivityIndicator size="large" color={colors.primary} /></View>
  );

  if (!paciente) return (
    <View style={styles.container}><Text>Paciente não encontrado</Text></View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{paciente.nome}</Text>
      <Text style={styles.subtitle}>{paciente.email}</Text>

      <TouchableOpacity style={styles.button} onPress={handleOpenChat} disabled={starting}>
        <Text style={styles.buttonText}>{starting ? 'Abrindo...' : 'Abrir Chat'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondary]} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitle: { marginTop: 8, color: '#6B7280' },
  button: { marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  secondary: { backgroundColor: '#888' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

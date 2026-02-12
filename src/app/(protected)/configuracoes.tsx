import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Switch, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { obterUsuarioAtual, buscarConfiguracoes, atualizarConfiguracoes } from '@/services/auth';

export default function ConfiguracoesShared() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const user = await obterUsuarioAtual();
      if (!user) {
        if (mounted) setLoading(false);
        return;
      }

      const res = await buscarConfiguracoes(user.id);
      if (res.sucesso) {
        if (mounted) setConfig(res.dados);
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const togglePush = async () => {
    if (!config) return;
    const novo = { ...config, receber_notificacoes_push: !config.receber_notificacoes_push };
    setConfig(novo);
    const res = await atualizarConfiguracoes(config.usuario_id, { receber_notificacoes_push: novo.receber_notificacoes_push });
    if (!res.sucesso) {
      Alert.alert('Erro', res.erro || 'Não foi possível salvar');
    }
  };

  if (loading) return (
    <View style={styles.container}><ActivityIndicator size="large" color={colors.primary} /></View>
  );

  if (!config) return (
    <View style={styles.container}><Text>Configurações não encontradas</Text></View>
  );

  return (
    <View style={styles.containerInner}>
      <Text style={styles.title}>Configurações</Text>

      <View style={styles.row}>
        <Text>Receber notificações push</Text>
        <Switch value={!!config.receber_notificacoes_push} onValueChange={togglePush} />
      </View>

      <TouchableOpacity style={[styles.button, styles.secondary]} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  containerInner: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, backgroundColor: '#fff', paddingHorizontal: 12, borderRadius: 8, marginBottom: 12 },
  button: { marginTop: 8, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  secondary: { backgroundColor: '#888' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

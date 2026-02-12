import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import ProfileOption from '@/components/ProfileOption';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { ConfiguracoesPrivacidade } from '@/types/auth';
import {
  obterUsuarioAtual,
  buscarConfiguracoes,
  atualizarConfiguracoes,
  recuperarSenha,
} from '@/services/auth';

interface ToggleItemProps {
  label: string;
  valor: boolean;
  onChange: (novoValor: boolean) => void;
  icon?: string;
}

function ToggleItem({ label, valor, onChange, icon }: ToggleItemProps) {
  return (
    <View style={styles.toggleItem}>
      <View style={styles.toggleLeft}>
        {icon && <Ionicons name={icon as any} size={20} color={colors.text} />}
        <Text style={styles.toggleLabel}>{label}</Text>
      </View>
      <Switch
        value={valor}
        onValueChange={onChange}
        trackColor={{ false: '#E0E0E0', true: colors.primary }}
        thumbColor={colors.white}
        ios_backgroundColor="#E0E0E0"
      />
    </View>
  );
}

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [emailUsuario, setEmailUsuario] = useState('');
  const [config, setConfig] = useState<ConfiguracoesPrivacidade>({
    id: '',
    usuario_id: '',
    compartilhar_diario_psicologo: false,
    receber_notificacoes_push: true,
    receber_notificacoes_email: true,
    created_at: null,
    updated_at: null,
  });

  // Estados locais para notificações específicas (não estão no backend ainda)
  const [lembreteAplicacao, setLembreteAplicacao] = useState(true);
  const [lembreteConsulta, setLembreteConsulta] = useState(true);
  const [lembreteDiario, setLembreteDiario] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      const usuario = await obterUsuarioAtual();
      if (usuario) {
        setUsuarioId(usuario.id);
        setEmailUsuario(usuario.email);

        const resultado = await buscarConfiguracoes(usuario.id);
        if (resultado.sucesso && resultado.dados) {
          setConfig(resultado.dados);
        }
      }
      setCarregando(false);
    };
    carregar();
  }, []);

  const atualizarToggle = useCallback(
    async (campo: keyof ConfiguracoesPrivacidade, valor: boolean) => {
      if (!usuarioId) return;

      setConfig(prev => ({ ...prev, [campo]: valor }));

      const resultado = await atualizarConfiguracoes(usuarioId, {
        [campo]: valor,
      });

      if (!resultado.sucesso) {
        setConfig(prev => ({ ...prev, [campo]: !valor }));
        Alert.alert('Erro', resultado.erro || 'Não foi possível salvar.');
      }
    },
    [usuarioId]
  );

  const handleAntecedenciaLembrete = () => {
    Alert.alert(
      'Antecedência do Lembrete',
      'Escolha com quanto tempo de antecedência deseja ser lembrado',
      [
        { text: '15 minutos', onPress: () => console.log('15min') },
        { text: '30 minutos', onPress: () => console.log('30min') },
        { text: '1 hora', onPress: () => console.log('1h') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleAlterarSenha = useCallback(async () => {
    if (!emailUsuario) return;

    Alert.alert(
      'Alterar Senha',
      `Enviaremos um email de recuperação para ${emailUsuario}. Deseja continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            const resultado = await recuperarSenha(emailUsuario);
            if (resultado.sucesso) {
              Alert.alert('Email enviado', 'Verifique sua caixa de entrada para redefinir a senha.');
            } else {
              Alert.alert('Erro', resultado.erro || 'Falha ao enviar email.');
            }
          },
        },
      ]
    );
  }, [emailUsuario]);

  const handleExcluirConta = useCallback(() => {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza? Todos os seus dados serão apagados permanentemente. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmar Exclusão',
              'Esta é sua última chance. Deseja realmente excluir sua conta permanentemente?',
              [
                { text: 'Não, manter conta', style: 'cancel' },
                {
                  text: 'Sim, excluir',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Em desenvolvimento', 'A exclusão de conta será implementada em breve.');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, []);

  const handleApagarHistorico = () => {
    Alert.alert(
      'Apagar Histórico',
      'Tem certeza? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => Alert.alert('Histórico apagado', 'Funcionalidade em desenvolvimento'),
        },
      ]
    );
  };

  if (carregando) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header title="Configurações" showBackButton />
        <View style={styles.carregandoContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Configurações" showBackButton />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Notificações */}
        <Text style={styles.sectionTitle}>Notificações</Text>
        <View style={styles.card}>
          <ToggleItem
            icon="notifications-outline"
            label="Notificações Push"
            valor={config.receber_notificacoes_push ?? true}
            onChange={(v) => atualizarToggle('receber_notificacoes_push', v)}
          />

          {config.receber_notificacoes_push && (
            <>
              <View style={styles.divider} />
              <ToggleItem
                icon="medical-outline"
                label="Lembrete de aplicação"
                valor={lembreteAplicacao}
                onChange={setLembreteAplicacao}
              />
              <View style={styles.divider} />
              <ToggleItem
                icon="calendar-outline"
                label="Lembrete de consulta"
                valor={lembreteConsulta}
                onChange={setLembreteConsulta}
              />
              <View style={styles.divider} />
              <ToggleItem
                icon="book-outline"
                label="Lembrete de diário"
                valor={lembreteDiario}
                onChange={setLembreteDiario}
              />
              <View style={styles.divider} />
              <TouchableOpacity style={styles.optionRow} onPress={handleAntecedenciaLembrete}>
                <View style={styles.toggleLeft}>
                  <Ionicons name="time-outline" size={20} color={colors.text} />
                  <Text style={styles.toggleLabel}>Antecedência do lembrete</Text>
                </View>
                <View style={styles.optionRight}>
                  <Text style={styles.optionValue}>30 min</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                </View>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.divider} />
          <ToggleItem
            icon="mail-outline"
            label="Notificações por email"
            valor={config.receber_notificacoes_email ?? true}
            onChange={(v) => atualizarToggle('receber_notificacoes_email', v)}
          />
        </View>

        {/* Privacidade */}
        <Text style={styles.sectionTitle}>Privacidade</Text>
        <View style={styles.card}>
          <ToggleItem
            icon="people-outline"
            label="Compartilhar diário com psicólogo"
            valor={config.compartilhar_diario_psicologo ?? false}
            onChange={(v) => atualizarToggle('compartilhar_diario_psicologo', v)}
          />
        </View>

        {/* Dados */}
        <Text style={styles.sectionTitle}>Dados</Text>
        <ProfileOption
          icon="trash-outline"
          title="Apagar Histórico"
          subtitle="Remove todo o histórico de aplicações"
          onPress={handleApagarHistorico}
          color="#F44336"
        />

        {/* Conta */}
        <Text style={styles.sectionTitle}>Conta</Text>
        <ProfileOption
          icon="key-outline"
          title="Alterar Senha"
          subtitle="Enviar email de recuperação"
          onPress={handleAlterarSenha}
        />
        <ProfileOption
          icon="trash-outline"
          title="Excluir Conta"
          subtitle="Remover permanentemente sua conta"
          onPress={handleExcluirConta}
          color="#F44336"
        />

        {/* Sobre */}
        <Text style={styles.sectionTitle}>Sobre</Text>
        <ProfileOption
          icon="information-circle-outline"
          title="Versão do App"
          subtitle="1.0.0"
          onPress={() => {}}
          showChevron={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom:20,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 15,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
});
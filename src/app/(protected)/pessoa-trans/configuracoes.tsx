import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
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
}

function ToggleItem({ label, valor, onChange }: ToggleItemProps) {
  return (
    <View style={styles.toggleItem}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={valor}
        onValueChange={onChange}
        trackColor={{ false: '#D0D0D0', true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export default function ConfiguracoesScreen() {
  const [carregando, setCarregando] = useState(true);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [emailUsuario, setEmailUsuario] = useState('');
  const [config, setConfig] = useState<ConfiguracoesPrivacidade>({
    id: '',
    usuario_id: '',
    compartilhar_diario_psicologo: false,
    mostrar_perfil_comunidade: true,
    receber_notificacoes_push: true,
    receber_notificacoes_email: true,
    perfil_anonimo_comunidade: false,
    created_at: null,
    updated_at: null,
  });

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
        // Reverter em caso de erro
        setConfig(prev => ({ ...prev, [campo]: !valor }));
        Alert.alert('Erro', resultado.erro || 'Não foi possível salvar.');
      }
    },
    [usuarioId]
  );

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
              Alert.alert(
                'Email enviado',
                'Verifique sua caixa de entrada para redefinir a senha.'
              );
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
      'Tem certeza que deseja excluir sua conta? Essa ação é irreversível e todos os seus dados serão perdidos.',
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
                    Alert.alert(
                      'Em desenvolvimento',
                      'A exclusão de conta será implementada em breve.'
                    );
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, []);

  const handleTema = useCallback(() => {
    Alert.alert('Em desenvolvimento', 'O tema escuro será implementado em breve!');
  }, []);

  if (carregando) {
    return (
      <View style={styles.container}>
        <Header title="Configurações" showBackButton />
        <View style={styles.carregandoContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Configurações" showBackButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacidade */}
        <Text style={styles.sectionTitle}>Privacidade</Text>
        <View style={styles.card}>
          <ToggleItem
            label="Compartilhar diário com psicólogo"
            valor={config.compartilhar_diario_psicologo ?? false}
            onChange={(v) => atualizarToggle('compartilhar_diario_psicologo', v)}
          />
          <ToggleItem
            label="Mostrar perfil na comunidade"
            valor={config.mostrar_perfil_comunidade ?? true}
            onChange={(v) => atualizarToggle('mostrar_perfil_comunidade', v)}
          />
          <ToggleItem
            label="Perfil anônimo na comunidade"
            valor={config.perfil_anonimo_comunidade ?? false}
            onChange={(v) => atualizarToggle('perfil_anonimo_comunidade', v)}
          />
        </View>

        {/* Notificações */}
        <Text style={styles.sectionTitle}>Notificações</Text>
        <View style={styles.card}>
          <ToggleItem
            label="Notificações push"
            valor={config.receber_notificacoes_push ?? true}
            onChange={(v) => atualizarToggle('receber_notificacoes_push', v)}
          />
          <ToggleItem
            label="Notificações por email"
            valor={config.receber_notificacoes_email ?? true}
            onChange={(v) => atualizarToggle('receber_notificacoes_email', v)}
          />
        </View>

        {/* Conta */}
        <Text style={styles.sectionTitle}>Conta</Text>
        <ProfileOption
          icon="lock-closed-outline"
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

        {/* Aparência */}
        <Text style={styles.sectionTitle}>Aparência</Text>
        <ProfileOption
          icon="color-palette-outline"
          title="Tema"
          subtitle="Claro"
          onPress={handleTema}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
});

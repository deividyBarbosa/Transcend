import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import ProfileOption from '@/components/ProfileOption';
import SelectModal from '@/components/SelectModal';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { Usuario } from '@/types/auth';
import {
  obterUsuarioAtual,
  fazerLogout,
} from '@/services/auth';

const PRONOMES = [
  'Ele/Dele',
  'Ela/Dela',
  'Elu/Delu',
  'Ele/Ela',
];

export default function PerfilScreen() {
  const router = useRouter();
  const [showPronomesModal, setShowPronomesModal] = useState(false);
  const [pronomes, setPronomes] = useState('Ela/Dela');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregarPerfil = useCallback(async () => {
    const usuarioAtual = await obterUsuarioAtual();
    if (usuarioAtual) {
      setUsuario(usuarioAtual);
    }
    setCarregando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [carregarPerfil])
  );

  const handleEditarPerfil = () => {
    router.push('/(protected)/pessoa-trans/editar-perfil');
  };

  const handleConfiguracoes = () => {
    router.push('/(protected)/pessoa-trans/configuracoes');
  };

  const handleAjuda = () => {
    const email = 'ajuda@transcend.com.br';
    const subject = 'Preciso de ajuda com o app Transcend';
    const body = 'Olá, gostaria de ajuda com...';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o cliente de email');
    });
  };

  const handleSobreApp = async () => {
    const url = 'https://github.com/deividyBarbosa/Transcend/blob/main/README.md';
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert('Erro', 'Não foi possível abrir o navegador');
    }
  };

  const handleSair = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            const resultado = await fazerLogout();
            if (resultado.sucesso) {
              router.replace('/');
            } else {
              Alert.alert('Erro', resultado.erro || 'Não foi possível sair.');
            }
          },
        },
      ]
    );
  };

  const getIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (carregando) {
    return (
      <View style={[styles.safeArea, styles.carregandoContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const nomeExibicao = usuario?.nome || 'Usuário';
  const emailExibicao = usuario?.email || '';

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com avatar e info */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {usuario?.foto_url ? (
              <Image
                source={{ uri: usuario.foto_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {getIniciais(nomeExibicao)}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.nome}>{nomeExibicao}</Text>

          {/* Pronomes */}
          <TouchableOpacity
            style={styles.pronomesButton}
            onPress={() => setShowPronomesModal(true)}
          >
            <Text style={styles.pronomes}>{pronomes}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.muted} />
          </TouchableOpacity>

          <Text style={styles.email}>{emailExibicao}</Text>
        </View>

        {/* Seção: Conta */}
        <Text style={styles.sectionTitle}>Conta</Text>
        <ProfileOption
          icon="person-outline"
          title="Editar Perfil"
          subtitle="Nome e informacoes pessoais"
          onPress={handleEditarPerfil}
        />
        <ProfileOption
          icon="settings-outline"
          title="Configurações"
          subtitle="Notificações, privacidade, tema"
          onPress={handleConfiguracoes}
        />

        {/* Seção: Suporte */}
        <Text style={styles.sectionTitle}>Suporte</Text>
        <ProfileOption
          icon="help-circle-outline"
          title="Ajuda"
          subtitle="Entre em contato conosco"
          onPress={handleAjuda}
        />
        <ProfileOption
          icon="information-circle-outline"
          title="Sobre o App"
          subtitle="Versão, termos e privacidade"
          onPress={handleSobreApp}
        />

        {/* Botão Sair */}
        <View style={styles.logoutContainer}>
          <ProfileOption
            icon="log-out-outline"
            title="Sair da Conta"
            onPress={handleSair}
            color="#F44336"
            showChevron={false}
          />
        </View>

        {/* Versão */}
        <Text style={styles.version}>Versão 1.0.0</Text>
      </ScrollView>

      {/* Modal de Pronomes */}
      <SelectModal
        visible={showPronomesModal}
        title="Selecionar Pronomes"
        options={PRONOMES}
        selectedValue={pronomes}
        onSelect={(value) => {
          setPronomes(value);
          setShowPronomesModal(false);
        }}
        onClose={() => setShowPronomesModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  carregandoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 36,
    color: colors.white,
  },
  nome: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.text,
    marginBottom: 4,
  },
  pronomesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 8,
  },
  pronomes: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primary,
  },
  email: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 1,
  },
  logoutContainer: {
    marginTop: 24,
  },
  version: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 32,
  },
});


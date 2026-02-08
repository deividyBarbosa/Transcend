import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SelectModal from '@/components/SelectModal';
import DismissKeyboard from '@/components/DismissKeyboard';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import * as ImagePicker from 'expo-image-picker';

const PRONOMES = ['Ele/Dele', 'Ela/Dela', 'Elu/Delu', 'Ele/Ela', 'Outro'];

export default function EditarPerfilScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  // Mock de dados do usuário
  const [nome, setNome] = useState('Alex Santos');
  const [email, setEmail] = useState('alex@email.com');
  const [pronomes, setPronomes] = useState('Ele/Dele');
  const [showPronomesModal, setShowPronomesModal] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  // Estados para trocar senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [salvando, setSalvando] = useState(false);

  const handleSelecionarFoto = async () => {
    Alert.alert(
        'Foto de Perfil',
        'Escolha uma opção',
        [
        {
            text: 'Tirar Foto',
            onPress: async () => {
            // Pedir permissão para câmera
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            
            if (!permission.granted) {
                Alert.alert('Permissão negada', 'Precisamos de acesso à câmera');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setFotoPerfil(result.assets[0].uri);
            }
            },
        },
        {
            text: 'Escolher da Galeria',
            onPress: async () => {
            // Pedir permissão para galeria
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (!permission.granted) {
                Alert.alert('Permissão negada', 'Precisamos de acesso à galeria');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setFotoPerfil(result.assets[0].uri);
            }
            },
        },
        {
            text: 'Cancelar',
            style: 'cancel',
        },
        ]
      );
    };

  const validarFormulario = () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Nome não pode estar vazio');
      return false;
    }

    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Erro', 'Email inválido');
      return false;
    }

    // Se está tentando trocar senha
    if (senhaAtual || novaSenha || confirmarSenha) {
      if (!senhaAtual) {
        Alert.alert('Erro', 'Digite sua senha atual');
        return false;
      }
      if (!novaSenha) {
        Alert.alert('Erro', 'Digite a nova senha');
        return false;
      }
      if (novaSenha.length < 6) {
        Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres');
        return false;
      }
      if (novaSenha !== confirmarSenha) {
        Alert.alert('Erro', 'As senhas não coincidem');
        return false;
      }
    }

    return true;
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) return;

    setSalvando(true);

    // TO-DO: Integrar com Supabase
    setTimeout(() => {
      setSalvando(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 1000);
  };

  const getIniciais = (nomeCompleto: string) => {
    return nomeCompleto
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header title="Editar Perfil" showBackButton />

      <DismissKeyboard>
        <ScrollView
          ref={scrollRef}
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Foto de Perfil */}
          <View style={styles.fotoContainer}>
            <View style={styles.avatarContainer}>
              {fotoPerfil ? (
                <Image source={{ uri: fotoPerfil }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getIniciais(nome)}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.editFotoButton} onPress={handleSelecionarFoto}>
                <Ionicons name="camera" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.fotoLabel}>Toque para alterar a foto</Text>
          </View>

          {/* Informações Pessoais */}
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <Input
            label="Nome Completo"
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Pronomes</Text>
          <TouchableOpacity
            style={styles.pronomesInput}
            onPress={() => setShowPronomesModal(true)}
          >
            <Text style={styles.pronomesText}>{pronomes}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.muted} />
          </TouchableOpacity>

          {/* Trocar Senha */}
          <Text style={styles.sectionTitle}>Alterar Senha</Text>

          <Input
            label="Senha Atual"
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            placeholder="Digite sua senha atual"
            secureTextEntry
          />

          <Input
            label="Nova Senha"
            value={novaSenha}
            onChangeText={setNovaSenha}
            placeholder="Digite a nova senha (mín. 6 caracteres)"
            secureTextEntry
          />

          <Input
            label="Confirmar Nova Senha"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            placeholder="Digite novamente a nova senha"
            secureTextEntry
          />

          {/* Botões */}
          <Button
            title="Salvar Alterações"
            onPress={handleSalvar}
            loading={salvando}
            style={styles.saveButton}
          />

          <Button
            title="Cancelar"
            onPress={() => router.back()}
            variant="outline"
          />
        </ScrollView>
      </DismissKeyboard>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  fotoContainer: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 48,
    color: colors.white,
  },
  editFotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.background,
  },
  fotoLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginTop: 24,
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  pronomesInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pronomesText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 12,
  },
});
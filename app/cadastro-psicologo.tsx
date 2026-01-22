import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function CadastroPsicologoScreen() {
  const router = useRouter();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [numeroCRP, setNumeroCRP] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [documentoAnexado, setDocumentoAnexado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const validarCRP = (crp: string) => {
    // Validação básica do formato XX/XXXXX
    const crpRegex = /^\d{2}\/\d{5}$/;
    return crpRegex.test(crp);
  };

  const validarEmail = (email: string) => {
    return email.includes('@');
  };

  const validarSenha = (senha: string) => {
    return senha.length >= 8 && senha.length <= 16;
  };

  const handleUpload = () => {
    // Mock de upload - apenas simula que o arquivo foi anexado
    Alert.alert(
      'Upload de documento',
      'Funcionalidade em desenvolvimento. Por enquanto, simularemos o anexo.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Simular anexo',
          onPress: () => {
            setDocumentoAnexado(true);
            Alert.alert('Sucesso', 'Documento anexado!');
          },
        },
      ]
    );
  };

  const handleCadastrar = async () => {
    // Validações
    if (!nomeCompleto || !numeroCRP || !email || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos');
      return;
    }

    if (!validarCRP(numeroCRP)) {
      Alert.alert('Atenção', 'Formato do CRP inválido. Use o formato: 01/12345');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('Atenção', 'Email inválido. Deve conter @');
      return;
    }

    if (!validarSenha(senha)) {
      Alert.alert('Atenção', 'A senha deve ter entre 8 e 16 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem');
      return;
    }

    if (!documentoAnexado) {
      Alert.alert('Atenção', 'Por favor, anexe a comprovação do CRP');
      return;
    }

    setCarregando(true);
    
    // Simula envio para o backend
    setTimeout(() => {
      setCarregando(false);
      router.push('/cadastro-analise');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* Botão de voltar */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Título */}
        <Text style={styles.title}>Cadastro Psicólogo</Text>

        {/* Nome completo */}
        <Text style={styles.label}>Nome completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          placeholderTextColor="#999"
          value={nomeCompleto}
          onChangeText={setNomeCompleto}
          autoCapitalize="words"
        />

        {/* Número do CRP */}
        <Text style={styles.label}>Número do CRP</Text>
        <TextInput
          style={styles.input}
          placeholder="01/XXXXX"
          placeholderTextColor="#999"
          value={numeroCRP}
          onChangeText={setNumeroCRP}
          keyboardType="numbers-and-punctuation"
        />

        {/* E-mail */}
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Senha */}
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Senha de 8 a 16 dígitos"
          placeholderTextColor="#999"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Confirmar senha */}
        <Text style={styles.label}>Confirmar senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirme sua senha"
          placeholderTextColor="#999"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Envio de documentos */}
        <View style={styles.uploadSection}>
          <Text style={styles.uploadTitle}>Envio de documentos</Text>
          <View style={styles.uploadBox}>
            <Text style={styles.uploadLabel}>Comprovação de CRP</Text>
            <Text style={styles.uploadSubtitle}>PDF, max 5 MB</Text>
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={handleUpload}
            >
              <Text style={styles.uploadButtonText}>
                {documentoAnexado ? 'Documento anexado ✓' : 'Upload'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão Cadastrar */}
        <TouchableOpacity
          style={[styles.submitButton, carregando && styles.submitButtonDisabled]}
          onPress={handleCadastrar}
          disabled={carregando}
        >
          <Text style={styles.submitButtonText}>
            {carregando ? 'CADASTRANDO...' : 'Cadastrar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2E8EB',
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#333',
  },
  uploadSection: {
    marginTop: 10,
    marginBottom: 30,
  },
  uploadTitle: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  uploadBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  uploadLabel: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#666',
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D65C73',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  uploadButtonText: {
    color: '#D65C73',
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  submitButton: {
    width: '100%',
    height: 55,
    backgroundColor: '#D65C73',
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
});
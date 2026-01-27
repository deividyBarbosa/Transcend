import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert} from 'react-native';
import { useRouter } from 'expo-router';
import DismissKeyboard from '../src/components/DismissKeyboard';
import Header from '../src/components/Header';
import Input from '../src/components/Input';
import Button from '../src/components/Button';

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
    // Validação básica do CRP
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
    <DismissKeyboard>
      <View style={styles.container}>

        <Header title="Cadastro Psicólogo" showBackButton />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

        {/* Título */}

          <Text style={styles.title}>Cadastro Psicólogo</Text>

        {/* Inputs */}
 
          <Input
            label="Nome completo"
            placeholder="Digite seu nome"
            value={nomeCompleto}
            onChangeText={setNomeCompleto}
            autoCapitalize="words"
          />

          <Input
            label="Número do CRP"
            placeholder="01/XXXXX"
            value={numeroCRP}
            onChangeText={setNumeroCRP}
            keyboardType="numbers-and-punctuation"
          />

          <Input
            label="E-mail"
            placeholder="Digite seu email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Senha"
            placeholder="Senha de 8 a 16 dígitos"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoCapitalize="none"
          />

          <Input
            label="Confirmar senha"
            placeholder="Confirme sua senha"
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
            <Button 
              title="Cadastrar" 
              onPress={handleCadastrar}
              loading={carregando}
            />
        </ScrollView>
      </View>
    </DismissKeyboard>  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2E8EB',
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
  }
});
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
import * as DocumentPicker from 'expo-document-picker';
import { cadastrarPsicologo } from '../src/services/auth';
import { supabase } from '../utils/supabase';

export default function CadastroPsicologoScreen() {
  const router = useRouter();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [numeroCRP, setNumeroCRP] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [documento, setDocumento] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [carregando, setCarregando] = useState(false);

  const validarCRP = (crp: string) => {
    const crpRegex = /^\d{2}\/\d{5}$/;
    return crpRegex.test(crp);
  };

  const validarEmail = (email: string) => {
    return email.includes('@') && email.includes('.');
  };

  const validarSenha = (senha: string) => {
    return senha.length >= 8 && senha.length <= 16;
  };

  const validarCPF = (cpf: string) => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.length === 11;
  };

  const validarDataNascimento = (data: string) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    return regex.test(data);
  };

  const formatarCPF = (texto: string) => {
    const numeros = texto.replace(/\D/g, '');
    if (numeros.length <= 3) return numeros;
    if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9, 11)}`;
  };

  const formatarData = (texto: string) => {
    const numeros = texto.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
  };

  const converterDataParaISO = (data: string) => {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  };

  const handleUpload = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (resultado.canceled || !resultado.assets?.[0]) {
        return;
      }

      const arquivo = resultado.assets[0];

      if (arquivo.size && arquivo.size > 5 * 1024 * 1024) {
        Alert.alert('Erro', 'O arquivo deve ter no máximo 5MB');
        return;
      }

      setDocumento({
        uri: arquivo.uri,
        name: arquivo.name,
        type: arquivo.mimeType || 'application/pdf',
      });

      Alert.alert('Sucesso', 'Documento anexado!');
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível selecionar o documento');
    }
  };

  const handleCadastrar = async () => {
    console.log('Iniciando validação...');

    // Validações
    if (!nomeCompleto || !cpf || !dataNascimento || !numeroCRP || !email || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!validarCPF(cpf)) {
      Alert.alert('Atenção', 'CPF inválido');
      return;
    }

    if (!validarDataNascimento(dataNascimento)) {
      Alert.alert('Atenção', 'Data de nascimento inválida. Use o formato: DD/MM/AAAA');
      return;
    }

    if (!validarCRP(numeroCRP)) {
      Alert.alert('Atenção', 'Formato do CRP inválido. Use o formato: 01/12345');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('Atenção', 'Email inválido');
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

    if (!documento) {
      Alert.alert('Atenção', 'Por favor, anexe a comprovação do CRP');
      return;
    }

    console.log('Validação OK, iniciando cadastro...');
    setCarregando(true);

    try {
      // 1. Cadastrar o psicólogo
      const resultadoCadastro = await cadastrarPsicologo({
        nome_social: nomeCompleto,
        nome_civil: nomeCompleto,
        email,
        senha,
        data_nascimento: converterDataParaISO(dataNascimento),
        crp: numeroCRP,
      });

      console.log('Resultado cadastro:', resultadoCadastro);

      if (!resultadoCadastro.sucesso || !resultadoCadastro.dados) {
        Alert.alert('Erro', resultadoCadastro.erro || 'Erro ao realizar cadastro');
        setCarregando(false);
        return;
      }

      // 2. Fazer upload do documento CRP
      let uploadSucesso = false;
      try {
        const extensao = documento.name.split('.').pop();
        const nomeArquivo = `${resultadoCadastro.dados.id}/crp_${Date.now()}.${extensao}`;

        const response = await fetch(documento.uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(nomeArquivo, blob, {
            contentType: documento.type,
            upsert: true,
          });

        uploadSucesso = !uploadError;
        if (uploadError) {
          console.error('Erro no upload:', uploadError);
        }
      } catch (uploadErr) {
        console.error('Erro no upload:', uploadErr);
      }

      console.log('Upload sucesso:', uploadSucesso);

      if (!uploadSucesso) {
        Alert.alert(
          'Aviso',
          'Cadastro realizado, mas houve um erro ao enviar o documento. Você pode enviá-lo depois.'
        );
      }

      router.push('/cadastro-analise');
    } catch (erro) {
      console.error('Erro no cadastro:', erro);
      Alert.alert('Erro', 'Ocorreu um erro ao realizar o cadastro');
    } finally {
      setCarregando(false);
    }
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
        <Text style={styles.label}>Nome completo *</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          placeholderTextColor="#999"
          value={nomeCompleto}
          onChangeText={setNomeCompleto}
          autoCapitalize="words"
        />

        {/* CPF */}
        <Text style={styles.label}>CPF *</Text>
        <TextInput
          style={styles.input}
          placeholder="000.000.000-00"
          placeholderTextColor="#999"
          value={cpf}
          onChangeText={(texto) => setCpf(formatarCPF(texto))}
          keyboardType="numeric"
          maxLength={14}
        />

        {/* Data de nascimento */}
        <Text style={styles.label}>Data de nascimento *</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          placeholderTextColor="#999"
          value={dataNascimento}
          onChangeText={(texto) => setDataNascimento(formatarData(texto))}
          keyboardType="numeric"
          maxLength={10}
        />

        {/* Número do CRP */}
        <Text style={styles.label}>Número do CRP *</Text>
        <TextInput
          style={styles.input}
          placeholder="01/12345"
          placeholderTextColor="#999"
          value={numeroCRP}
          onChangeText={setNumeroCRP}
          keyboardType="numbers-and-punctuation"
        />

        {/* E-mail */}
        <Text style={styles.label}>E-mail *</Text>
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
        <Text style={styles.label}>Senha *</Text>
        <TextInput
          style={styles.input}
          placeholder="Senha de 8 a 16 caracteres"
          placeholderTextColor="#999"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Confirmar senha */}
        <Text style={styles.label}>Confirmar senha *</Text>
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
            <Text style={styles.uploadLabel}>Comprovação de CRP *</Text>
            <Text style={styles.uploadSubtitle}>PDF, max 5 MB</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUpload}
            >
              <Text style={styles.uploadButtonText}>
                {documento ? 'Documento anexado' : 'Upload'}
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

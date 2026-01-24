import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fazerLogin } from '../src/services/auth';
import DismissKeyboard from '../src/components/DismissKeyboard';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos');
      return;
    }

    setCarregando(true);
    try {
      const resultado = await fazerLogin(email, senha);
      
      if (resultado.sucesso) {
        router.replace('/inicio');
      } else {
        Alert.alert('Erro', resultado.erro || 'Credenciais inválidas');
      }
    } catch (erro) {
      Alert.alert('Erro', 'Ocorreu um erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <DismissKeyboard>
      <View style={styles.container}>
      {/* Logo/Imagem da borboleta - largura total */}
      <Image
        source={require('../assets/butterfly.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Conteúdo com padding */}
      
        <View style={styles.content}>
          {/* Texto de boas-vindas */}
          <Text style={styles.title}>Bem-vindo de volta</Text>

          {/* Campo de Email */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Campo de Senha */}
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#999"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Link Esqueceu a senha */}
          <TouchableOpacity onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}>
            <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          {/* Botão Entrar */}
          <TouchableOpacity
            style={[styles.button, carregando && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={carregando}
          >
            <Text style={styles.buttonText}>
              {carregando ? 'ENTRANDO...' : 'ENTRAR'}
            </Text>
          </TouchableOpacity>

          {/* Link para cadastro */}
          <TouchableOpacity onPress={() => router.push('/cadastro')}>
            <Text style={styles.signupText}>Não tem conta? Cadastre-se</Text>
          </TouchableOpacity>
        </View>
        </View>
      </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2E8EB',
  },
  logo: {
    width: '100%',
    height: 250,
    marginTop: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#333',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#333',
  },
  forgotPassword: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#666',
    marginBottom: 25,
    alignSelf: 'flex-start',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#D65C73',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  signupText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#666',
  },
});
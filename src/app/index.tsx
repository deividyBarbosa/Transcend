import React, { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image, Alert, ScrollView} from 'react-native';
import { useRouter } from 'expo-router';
import { fazerLogin } from '@/services/auth';
import DismissKeyboard from '@/components/DismissKeyboard';
import Input from '@/components/Input';
import Button from '@/components/Button';

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
        router.replace('/pessoa-trans');
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
      <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
      >
      {/* Borboleta */}
      <Image
        source={require('@/assets/butterfly.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.content}>
        {/* Texto de boas-vindas */}
        <Text style={styles.title}>Bem-vindo de volta</Text>

        {/* Campos */}
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Input
          placeholder="Senha"
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
        <Button 
          title="ENTRAR" 
          onPress={handleLogin}
          loading={carregando}
        />
        <Button
          title="teste psicologo"
          onPress={() => router.push('/(public)/(tabs-psicologo)/home-psicologo')}
        />

        {/* Link para cadastro */}
        <TouchableOpacity onPress={() => router.push('/(public)/cadastro/cadastro')}>
          <Text style={styles.signupText}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
       </View>
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
  logo: {
    width: '100%',
    height: 250,
    marginTop: 70,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#333',
    marginBottom: 40,
    textAlign: 'center',
  },
  forgotPassword: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#666',
    marginBottom: 25,
    alignSelf: 'flex-start',
  },
  signupText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#666',
    marginTop: 15,
  },
});
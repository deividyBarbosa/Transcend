import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { recuperarSenha } from '@/services/auth';

export default function EsqueciSenhaScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);

  const validarEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEnviar = async () => {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Digite seu email');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('Atenção', 'Digite um email válido');
      return;
    }

    setEnviando(true);
    const resultado = await recuperarSenha(email);
    setEnviando(false);

    if (resultado.sucesso) {
      Alert.alert(
        'Email enviado!',
        'Verifique sua caixa de entrada para redefinir sua senha.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      Alert.alert('Erro', resultado.erro || 'Não foi possível enviar o email.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Recuperar Senha" showBackButton />

      <View style={styles.container}>
        <Text style={styles.title}>Esqueceu sua senha?</Text>
        <Text style={styles.subtitle}>
          Digite seu email e enviaremos um link para redefinir sua senha.
        </Text>

        <Input
          label="Email"
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Button
          title={enviando ? 'Enviando...' : 'Enviar Link'}
          onPress={handleEnviar}
          disabled={enviando}
          style={{ marginTop: 24 }}
        />
      </View>
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
    padding: 24,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.text,
    marginBottom: 20,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 18,
    color: colors.muted,
    lineHeight: 22,
    marginBottom: 20,
  },
});
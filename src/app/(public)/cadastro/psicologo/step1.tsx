import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import DismissKeyboard from '@/components/DismissKeyboard';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { cadastrarPsicologo } from '@/services/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CadastroPsicologoScreen() {
  const router = useRouter();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [numeroCRP, setNumeroCRP] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const validarCRP = (crp: string) => {
    const crpRegex = /^\d{2}\/\d{5}$/;
    return crpRegex.test(crp);
  };

  const validarEmail = (emailValue: string) => {
    return emailValue.includes('@') && emailValue.includes('.');
  };

  const validarSenha = (senhaValue: string) => {
    return senhaValue.length >= 8 && senhaValue.length <= 16;
  };

  const handleCadastrar = async () => {
    setErro(null);

    if (!nomeCompleto || !numeroCRP || !email || !senha || !confirmarSenha) {
      Alert.alert('Atencao', 'Por favor, preencha todos os campos obrigatorios');
      return;
    }

    if (!validarCRP(numeroCRP)) {
      Alert.alert('Atencao', 'Formato do CRP invalido. Use o formato: 01/12345');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('Atencao', 'Email invalido');
      return;
    }

    if (!validarSenha(senha)) {
      Alert.alert('Atencao', 'A senha deve ter entre 8 e 16 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atencao', 'As senhas nao coincidem');
      return;
    }

    setCarregando(true);

    try {
      const resultadoCadastro = await cadastrarPsicologo({
        nome: nomeCompleto,
        email,
        senha,
        crp: numeroCRP,
      });

      if (!resultadoCadastro.sucesso || !resultadoCadastro.dados) {
        if (resultadoCadastro.codigo === 'email_not_confirmed') {
          router.replace('/');
          return;
        }

        setErro(resultadoCadastro.erro || 'Erro ao realizar cadastro');
        setCarregando(false);
        return;
      }

      router.push('/cadastro/psicologo/step2');
    } catch (erro) {
      console.error('Erro no cadastro:', erro);
      setErro('Ocorreu um erro ao realizar o cadastro');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2E8EB' }} edges={['top', 'bottom']}>
      <DismissKeyboard>
        <View style={styles.container}>
          <Header title="Cadastro Psicologo" showBackButton />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Cadastro Psicologo</Text>
            <ErrorMessage message={erro} />

            <Input
              label="Nome completo"
              placeholder="Digite seu nome"
              value={nomeCompleto}
              onChangeText={(text: string) => {
                setErro(null);
                setNomeCompleto(text);
              }}
              autoCapitalize="words"
            />

            <Input
              label="Numero do CRP"
              placeholder="01/XXXXX"
              value={numeroCRP}
              onChangeText={(text: string) => {
                setErro(null);
                setNumeroCRP(text);
              }}
              keyboardType="numbers-and-punctuation"
            />

            <Input
              label="E-mail"
              placeholder="Digite seu email"
              value={email}
              onChangeText={(text: string) => {
                setErro(null);
                setEmail(text);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Senha"
              placeholder="Senha de 8 a 16 digitos"
              value={senha}
              onChangeText={(text: string) => {
                setErro(null);
                setSenha(text);
              }}
              secureTextEntry
              autoCapitalize="none"
            />

            <Input
              label="Confirmar senha"
              placeholder="Confirme sua senha"
              value={confirmarSenha}
              onChangeText={(text: string) => {
                setErro(null);
                setConfirmarSenha(text);
              }}
              secureTextEntry
              autoCapitalize="none"
            />

            <Button title="Cadastrar" onPress={handleCadastrar} loading={carregando} />
          </ScrollView>
        </View>
      </DismissKeyboard>
    </SafeAreaView>
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
});

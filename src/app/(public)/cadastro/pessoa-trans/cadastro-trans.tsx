import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import DismissKeyboard from '@/components/DismissKeyboard';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Header from '@/components/Header';
import SelectButton from '@/components/SelectButton';
import { cadastrarTrans } from '@/services/auth';
import type { Genero } from '@/types/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CadastroTransScreen() {
  const router = useRouter();
  const [nomeSocial, setNomeSocial] = useState('');
  const [genero, setGenero] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const validarEmail = (email: string) => { 
    return email.includes('@');
  };

  const validarSenha = (senha: string) => {
    return senha.length >= 8 && senha.length <= 16;
  };

  const handleCadastrar = async () => {
    // Validações
    if (!nomeSocial || !genero || !email || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos');
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

    setCarregando(true);

    try {
      const resultado = await cadastrarTrans({
        nome: nomeSocial,
        email,
        senha,
        genero: genero as Genero,
      });

      if (resultado.sucesso) {
        Alert.alert(
          'Cadastro realizado!',
          'Sua conta foi criada com sucesso. Faça login para continuar.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/'),
            },
          ]
        );
      } else {
        Alert.alert('Erro', resultado.erro || 'Erro ao realizar cadastro');
      }
    } catch (erro) {
      console.error('Erro no cadastro:', erro);
      Alert.alert('Erro', 'Ocorreu um erro ao realizar o cadastro');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2E8EB' }} edges={['top', 'bottom']}>
      <DismissKeyboard>
        <View style={styles.container}>

          <Header title="Cadastro" showBackButton />
            
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >

            {/* Nome social */}
              <Input
                label="Nome social"
                placeholder="Nome que te representa"
                value={nomeSocial}
                onChangeText={setNomeSocial}
                autoCapitalize="words"
              />

            {/*  Gênero */}

              <Text style={styles.label}>Gênero</Text>
              <View style={styles.genderContainer}>
                <SelectButton
                  label="Mulher trans"
                  selected={genero === 'mulher_trans'}
                  onPress={() => setGenero('mulher_trans')}
                />
                <SelectButton
                  label="Homem trans"
                  selected={genero === 'homem_trans'}
                  onPress={() => setGenero('homem_trans')}
                />
                <SelectButton
                  label="Pessoa não-binária"
                  selected={genero === 'nao_binario'}
                  onPress={() => setGenero('nao_binario')}
                />
              </View>

            {/* E-mail */}

              <Input
                label="E-mail"
                placeholder="Digite seu email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />


            {/* Senha */}
            
              <Input
                label="Senha"
                placeholder="Senha de 8 a 16 dígitos"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                autoCapitalize="none"
              />

            {/* Confirmar senha */}

              <Input
                label="Confirmar senha"
                placeholder="Confirme sua senha"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
                autoCapitalize="none"
              />

            {/* Botão Cadastrar */}
            
              <Button 
                title="Cadastrar" 
                onPress={handleCadastrar}
                loading={carregando}
              />
              
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
  label: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  genderContainer: {
    width: '100%',
    marginBottom: 20,
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
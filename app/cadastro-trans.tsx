import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import DismissKeyboard from '../src/components/DismissKeyboard';

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
    
    // Simula envio para o backend
    setTimeout(() => {
      setCarregando(false);
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
    }, 1500);
  };

  return (
      <DismissKeyboard>
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
            <Text style={styles.title}>Cadastro</Text>

            {/* Nome social */}
            <Text style={styles.label}>Nome social</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome que te representa"
              placeholderTextColor="#999"
              value={nomeSocial}
              onChangeText={setNomeSocial}
              autoCapitalize="words"
            />

            {/* Gênero */}
            <Text style={styles.label}>Gênero</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  genero === 'mulher_trans' && styles.genderButtonSelected,
                ]}
                onPress={() => setGenero('mulher_trans')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    genero === 'mulher_trans' && styles.genderButtonTextSelected,
                  ]}
                >
                  Mulher trans
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  genero === 'homem_trans' && styles.genderButtonSelected,
                ]}
                onPress={() => setGenero('homem_trans')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    genero === 'homem_trans' && styles.genderButtonTextSelected,
                  ]}
                >
                  Homem trans
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  genero === 'nao_binaria' && styles.genderButtonSelected,
                ]}
                onPress={() => setGenero('nao_binaria')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    genero === 'nao_binaria' && styles.genderButtonTextSelected,
                  ]}
                >
                  Pessoa não-binária
                </Text>
              </TouchableOpacity>
            </View>

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
      </DismissKeyboard>  
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
    fontSize: 28,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
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
  genderContainer: {
    width: '100%',
    marginBottom: 20,
    gap: 10,
  },
  genderButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#D65C73',
    borderColor: '#D65C73',
  },
  genderButtonText: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#333',
  },
  genderButtonTextSelected: {
    color: '#FFF',
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
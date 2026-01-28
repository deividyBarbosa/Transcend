/* faz nada nao isso aqui.. ignorem */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function CadastroAnaliseScreen() {
  const router = useRouter();

  const handleObterSuporte = () => {
    const email = 'suporte@transcend.com.br';
    const subject = 'Suporte - Cadastro em Análise';
    const body = 'Olá, gostaria de obter suporte sobre meu cadastro.';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o cliente de email');
    });
  };

  return (
    <View style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>Cadastro em Análise</Text>

      {/* Ilustração */}
      <Image
        source={require('@/assets/paperwork.png')}
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* Mensagem */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageTitle}>
          Estamos analisando seu{'\n'}cadastro!
        </Text>
        <Text style={styles.messageText}>
          Aguarde a validação do seu perfil. Você{'\n'}
          receberá uma notificação assim que estiver{'\n'}
          tudo pronto.
        </Text>
      </View>

      {/* Botão Obter Suporte */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleObterSuporte}
      >
        <Text style={styles.buttonText}>Obter suporte</Text>
      </TouchableOpacity>

      {/* Link para voltar ao login */}
      <TouchableOpacity
        style={styles.backToLogin}
        onPress={() => router.push('/')}
      >
        <Text style={styles.backToLoginText}>Voltar ao login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2E8EB',
    paddingHorizontal: 30,
    paddingTop: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  illustration: {
    width: '100%',
    height: 300,
    marginBottom: 40,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  messageTitle: {
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: '#D65C73',
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  backToLogin: {
    marginTop: 10,
  },
  backToLoginText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#666',
  },
});
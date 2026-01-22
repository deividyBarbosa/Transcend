import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function CadastroScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Botão de voltar */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.title}>Cadastrar-se</Text>

      {/* Ilustração */}
      <Image
        source={require('../assets/people.png')}
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* Botões de seleção */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/cadastro-trans')}
        >
          <Text style={styles.buttonText}>PESSOA TRANS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/cadastro-psicologo')}
        >
          <Text style={styles.buttonText}>PSICÓLOGO</Text>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 28,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  illustration: {
    width: '100%',
    height: 380,
    marginBottom: 1,
  },
  buttonsContainer: {
    paddingHorizontal: 30,
    gap: 20,
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: '#D65C73',
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
});
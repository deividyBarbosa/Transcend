import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import DismissKeyboard from '@/components/DismissKeyboard';
import Header from '@/components/Header';
import Button from '@/components/Button';

export default function CadastroScreen() {
  const router = useRouter();

  return (
    <DismissKeyboard>
      <View style={styles.container}>

        <Header title="Cadastrar-se" showBackButton />

        {/* Ilustração */}
        <Image
          source={require('@/assets/people.png')}
          style={styles.illustration}
          resizeMode="contain"
        />

        {/* Botões de seleção */}
        <View style={styles.buttonsContainer}>
          <Button
            title="PESSOA TRANS"
            onPress={() => router.push('/cadastro/pessoa-trans/cadastro-trans')}
          />
          <Button
            title="PSICÓLOGO"
            onPress={() => router.push('/cadastro/psicologo/step1')}
          />
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
  illustration: {
    width: '100%',
    height: 380,
    marginBottom: 1,
  },
  buttonsContainer: {
    paddingHorizontal: 30,
    gap: 20,
  },
});
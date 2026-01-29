// to-do: colocar a linha até o canto da tela

import { colors } from "@/theme/colors";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PsychologistHeader } from "@/components/psicologo/PsicologoHeader";
import Button from "@/components/Button";

export default function PsicologoHome() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  


return (
  <View style={styles.container}>
    <PsychologistHeader></PsychologistHeader>
    <Button
      title="Acompanhar solicitações"
      onPress={() => router.push("")}
      loading={carregando}
      style={{
        width: 253,
        height: 36,
        marginTop: 10,
      }}
    />
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems:"center"
  },
  logo: {
    width: '100%',
    height: 250,
    marginTop: 70,
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
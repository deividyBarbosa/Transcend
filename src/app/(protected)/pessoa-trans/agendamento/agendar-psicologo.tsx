import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { getMeuPsicologo, getOutrosPsicologos, Psicologo } from '@/mocks/mockPsicologos';

export default function AgendarPsicologoScreen() {
  const router = useRouter();
  const meuPsicologo = getMeuPsicologo();
  const outrosPsicologos = getOutrosPsicologos();

  const handleVerDisponibilidade = (psicologo: Psicologo) => {
    const params = new URLSearchParams({
      psicologoId: psicologo.id,
      nome: psicologo.nome,
      foto: psicologo.foto,
    }).toString();
    
    router.push(`/pessoa-trans/agendamento/agendar-consulta?${params}`);
  };

  const renderPsicologoCard = (psicologo: Psicologo, isPrincipal: boolean = false) => (
    <View key={psicologo.id} style={styles.card}>
      {isPrincipal && <Text style={styles.badge}>Seu Psicólogo</Text>}
      
      <View style={styles.cardContent}>
        <View style={styles.infoContainer}>
          <Text style={styles.tipoAtendimento}>{psicologo.tipo}</Text>
          <Text style={styles.nomePsicologo}>{psicologo.nome}</Text>
          <Text style={styles.especialidade}>{psicologo.especialidade}</Text>
          
          <TouchableOpacity
            style={styles.disponibilidadeButton}
            onPress={() => handleVerDisponibilidade(psicologo)}
          >
            <Text style={styles.disponibilidadeText}>Ver disponibilidade</Text>
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri: psicologo.foto }}
          style={styles.fotoPsicologo}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Header title="Agendar Psicólogo" showBackButton />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Meu Psicólogo */}
          {renderPsicologoCard(meuPsicologo, true)}

          {/* Outros Psicólogos */}
          <Text style={styles.sectionTitle}>Outros Psicólogos</Text>
          {outrosPsicologos.map(psicologo => 
            renderPsicologoCard(psicologo, false)
          )}
        </ScrollView>
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
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoContainer: {
    flex: 1,
    marginRight: 16,
  },
  tipoAtendimento: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.primary,
    marginBottom: 8,
  },
  nomePsicologo: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  especialidade: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.primary,
    marginBottom: 12,
    lineHeight: 18,
  },
  disponibilidadeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  disponibilidadeText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.white,
  },
  fotoPsicologo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E0E0E0',
  },
});
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Calendar from '@/components/Calendar';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { Ionicons } from '@expo/vector-icons';
import { getPsicologoById, getDatasDisponiveisByPsicologo } from '@/mocks/mockPsicologos';

export default function AgendarConsultaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const psicologoId = params.psicologoId as string || '1';
  const psicologo = getPsicologoById(psicologoId);
  const datasDisponiveis = getDatasDisponiveisByPsicologo(psicologoId);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDayPress = (day: number) => {
    setDiaSelecionado(day);
  };

  const handleVerDisponibilidade = () => {
    if (!diaSelecionado) {
      return;
    }
    
    const ano = currentMonth.getFullYear();
    const mes = currentMonth.getMonth();
    const dataFormatada = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(diaSelecionado).padStart(2, '0')}`;
    
    router.push(`/pessoa-trans/agendamento/horarios-disponiveis?psicologoId=${psicologoId}&data=${dataFormatada}&nome=${psicologo.nome}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Header title="Agendar consulta" showBackButton />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Informações do Psicólogo */}
          <View style={styles.psicologoCard}>
            <Image
              source={{ uri: psicologo.foto }}
              style={styles.fotoPsicologo}
            />
            <View style={styles.psicologoInfo}>
              <Text style={styles.nomePsicologo}>{psicologo.nome}</Text>
              <Text style={styles.especialidade}>{psicologo.especialidade}</Text>
              <Text style={styles.crp}>{psicologo.crp}</Text>
            </View>
          </View>

          {/* Detalhes da Sessão */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações da Consulta</Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="videocam-outline" size={20} color={colors.primary} />
              <Text style={styles.infoLabel}>Atendimento online via aplicativo</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.infoLabel}>Sessão de 60 minutos</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color={colors.primary} />
              <Text style={styles.infoLabel}>R$ 45,00 por consulta</Text>
            </View>
          </View>

          {/* Calendário */}
          <View style={styles.calendarioContainer}>
            <Calendar
              currentMonth={currentMonth}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
              onDayPress={handleDayPress}
              markedDates={datasDisponiveis}
              selectedDay={diaSelecionado ?? undefined}
            />
          </View>

          {/* Botão Ver Disponibilidade */}
          <View style={styles.buttonContainer}>
            <Button
              title="Ver disponibilidade"
              onPress={handleVerDisponibilidade}
              disabled={!diaSelecionado}
            />
          </View>
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
  psicologoCard: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  fotoPsicologo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  psicologoInfo: {
    alignItems: 'center',
  },
  nomePsicologo: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  especialidade: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    marginBottom: 2,
  },
  crp: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  calendarioContainer: {
    marginBottom: 24,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
});
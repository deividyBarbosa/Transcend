import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Calendar from '@/components/Calendar';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { Ionicons } from '@expo/vector-icons';


// Mock de dados do psicólogo
const PSICOLOGO_MOCK = {
  '1': {
    nome: 'Dr. Alex Cardoso',
    especialidade: 'Psicólogo',
    crp: 'CRP-SP 01234567',
    foto: 'https://i.pravatar.cc/150?img=33',
  },
  '2': {
    nome: 'Dra. Melissa Paiva',
    especialidade: 'Psicóloga',
    crp: 'CRP-SP 01234567',
    foto: 'https://i.pravatar.cc/150?img=47',
  },
  '3': {
    nome: 'Dra. Naila Azevedo',
    especialidade: 'Psicóloga',
    crp: 'CRP-SP 01234568',
    foto: 'https://i.pravatar.cc/150?img=44',
  },
};

// Mock de datas disponíveis por psicólogo (formato YYYY-MM-DD)
const DATAS_DISPONIVEIS_MOCK: { [key: string]: string[] } = {
  '1': [
    // Fevereiro 2026
    '2026-02-03', '2026-02-05', '2026-02-10', '2026-02-12', 
    '2026-02-17', '2026-02-19', '2026-02-24', '2026-02-26',
    // Março 2026
    '2026-03-03', '2026-03-05', '2026-03-10', '2026-03-12',
    '2026-03-17', '2026-03-19', '2026-03-24', '2026-03-26', '2026-03-31',
    // Abril 2026
    '2026-04-02', '2026-04-07', '2026-04-09', '2026-04-14',
    '2026-04-16', '2026-04-21', '2026-04-23', '2026-04-28', '2026-04-30',
  ],
  '2': [
    // Fevereiro 2026
    '2026-02-02', '2026-02-04', '2026-02-09', '2026-02-11',
    '2026-02-16', '2026-02-18', '2026-02-23', '2026-02-25',
    // Março 2026
    '2026-03-02', '2026-03-04', '2026-03-09', '2026-03-11',
    '2026-03-16', '2026-03-18', '2026-03-23', '2026-03-25', '2026-03-30',
    // Abril 2026
    '2026-04-01', '2026-04-06', '2026-04-08', '2026-04-13',
    '2026-04-15', '2026-04-20', '2026-04-22', '2026-04-27', '2026-04-29',
  ],
  '3': [
    // Fevereiro 2026
    '2026-02-06', '2026-02-13', '2026-02-20', '2026-02-27',
    // Março 2026
    '2026-03-06', '2026-03-13', '2026-03-20', '2026-03-27',
    // Abril 2026
    '2026-04-03', '2026-04-10', '2026-04-17', '2026-04-24',
  ],
};

export default function AgendarConsultaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const psicologoId = params.psicologoId as string || '1';
  const datasDisponiveis = DATAS_DISPONIVEIS_MOCK[psicologoId] || [];
  const nomePsicologo = params.nome as string;
  const fotoPsicologo = params.foto as string;
  
  // Usa os dados da URL se existirem, senão pega do mock
  const psicologo = nomePsicologo && fotoPsicologo ? {
    nome: nomePsicologo,
    especialidade: 'Psicólogo',
    crp: 'CRP-SP 01234567',
    foto: fotoPsicologo,
  } : PSICOLOGO_MOCK[psicologoId as keyof typeof PSICOLOGO_MOCK] || PSICOLOGO_MOCK['1'];
  
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
    
    router.push(`/pessoa-trans/horarios-disponiveis?psicologoId=${psicologoId}&data=${dataFormatada}&nome=${psicologo.nome}`);
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
  detalheRow: {
    marginBottom: 12,
  },
  detalheLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.primary,
  },
  detalheValorContainer: {
    marginTop: 4,
  },
  detalheValor: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  detalheSubvalor: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 2,
  },
  detalhePreco: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
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
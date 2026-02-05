// acho que dá pra deixar essa tela mais bonita, fora que precisamos pensar no que vem depois de confirmar consulta... e o pagamento?
// to-do: o que marina mandou sobre o pagamento

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import Button from '@/components/Button';
import CheckBox from '@/components/CheckBox';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

// Mock de horários disponíveis
const HORARIOS_MOCK = [
  { id: '1', horario: '09:00', tipo: 'Online', disponivel: true },
  { id: '2', horario: '10:00', tipo: 'Online', disponivel: true },
  { id: '3', horario: '11:00', tipo: 'Online', disponivel: true },
  { id: '4', horario: '14:00', tipo: 'Online', disponivel: false }, // indisponivel
  { id: '5', horario: '15:00', tipo: 'Online', disponivel: true },
  { id: '6', horario: '16:00', tipo: 'Online', disponivel: true },
  { id: '7', horario: '17:30', tipo: 'Online', disponivel: true },
  { id: '8', horario: '18:30', tipo: 'Online', disponivel: true },
];

interface Horario {
  id: string;
  horario: string;
  tipo: string;
  disponivel: boolean;
}

export default function HorariosDisponiveisScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const psicologoId = params.psicologoId as string;
  const data = params.data as string;
  const nomePsicologo = params.nome as string;
  
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);

  // Formatar data para exibição
  const formatarData = (dataISO: string) => {
    const [ano, mes, dia] = dataISO.split('-');
    const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    return dataObj.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleConfirmarAgendamento = () => {
    if (!horarioSelecionado) {
      Alert.alert('Atenção', 'Por favor, selecione um horário');
      return;
    }

    const horario = HORARIOS_MOCK.find(h => h.id === horarioSelecionado);
    
    Alert.alert(
      'Agendamento Confirmado',
      `Consulta agendada com ${nomePsicologo} para ${formatarData(data)} às ${horario?.horario}`,
      [
        {
          text: 'OK',
          onPress: () => router.push('/pessoa-trans/(tabs-pessoatrans)'),
        },
      ]
    );
  };

  const renderHorarioCard = (horario: Horario) => {
    const isSelecionado = horarioSelecionado === horario.id;
    const isDisponivel = horario.disponivel;

    return (
      <TouchableOpacity
        key={horario.id}
        style={[
          styles.horarioCard,
          !isDisponivel && styles.horarioCardDisabled,
        ]}
        onPress={() => isDisponivel && setHorarioSelecionado(horario.id)}
        disabled={!isDisponivel}
      >
        <View style={styles.horarioInfo}>
          <Text style={[
            styles.horarioTexto,
            !isDisponivel && styles.horarioTextoDisabled
          ]}>
            {horario.horario}
          </Text>
          <Text style={[
            styles.tipoTexto,
            !isDisponivel && styles.horarioTextoDisabled
          ]}>
            {horario.tipo}
          </Text>
        </View>
        
        <CheckBox
            label=""
            checked={isSelecionado}
            onPress={() => isDisponivel && setHorarioSelecionado(horario.id)}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Header title="Selecione o dia" showBackButton />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Título */}
          <Text style={styles.titulo}>Horários disponíveis</Text>
          <Text style={styles.subtitulo}>
            {formatarData(data)}
          </Text>

          {/* Lista de Horários */}
          <View style={styles.horariosContainer}>
            {HORARIOS_MOCK.map(renderHorarioCard)}
          </View>

          {/* Botão Confirmar */}
          <View style={styles.buttonContainer}>
            <Button
              title="Confirmar Agendamento"
              onPress={handleConfirmarAgendamento}
              disabled={!horarioSelecionado}
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
  titulo: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
    marginBottom: 4,
  },
  subtitulo: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    marginBottom: 24,
  },
  horariosContainer: {
    gap: 12,
    marginBottom: 24,
  },
  horarioCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  horarioCardDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  horarioInfo: {
    flex: 1,
  },
  horarioTexto: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  horarioTextoDisabled: {
    color: colors.muted,
  },
  tipoTexto: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  buttonContainer: {
    paddingTop: 8,
    paddingBottom: 20,
  },
});
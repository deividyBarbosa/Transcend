import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import Button from '@/components/Button';
import CheckBox from '@/components/CheckBox';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { supabase } from '@/utils/supabase';
import {
  agendarSessaoPsicologica,
  buscarHorariosDisponiveisPsicologo,
  type HorarioDisponivel,
} from '@/services/agendamento';

export default function HorariosDisponiveisScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const psicologoId = params.psicologoId as string;
  const data = params.data as string;

  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const carregar = async () => {
        if (!psicologoId || !data) {
          setCarregando(false);
          return;
        }

        setCarregando(true);
        const res = await buscarHorariosDisponiveisPsicologo(psicologoId, data);
        setHorarios(res.sucesso && res.dados ? res.dados : []);
        setCarregando(false);
      };

      carregar();
    }, [psicologoId, data])
  );

  const formatarData = (dataISO: string) => {
    const [ano, mes, dia] = dataISO.split('-');
    const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleConfirmarAgendamento = async () => {
    if (!horarioSelecionado) {
      Alert.alert('Atenção', 'Por favor, selecione um horário');
      return;
    }

    const { data: auth } = await supabase.auth.getUser();
    const pacienteId = auth.user?.id;
    if (!pacienteId) {
      Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
      return;
    }

    setSalvando(true);
    const resultado = await agendarSessaoPsicologica(pacienteId, psicologoId, data, horarioSelecionado);
    setSalvando(false);

    if (!resultado.sucesso) {
      Alert.alert('Erro', resultado.erro || 'Não foi possível agendar a consulta.');
      return;
    }

    Alert.alert('Solicitação enviada', 'A consulta foi solicitada. Aguarde a confirmação do psicólogo.', [
      {
        text: 'OK',
        onPress: () => router.push('/pessoa-trans/(tabs-pessoatrans)'),
      },
    ]);
  };

  const renderHorarioCard = (horario: HorarioDisponivel) => {
    const isSelecionado = horarioSelecionado === horario.horario;
    const isDisponivel = horario.disponivel;

    return (
      <TouchableOpacity
        key={horario.id}
        style={[styles.horarioCard, !isDisponivel && styles.horarioCardDisabled]}
        onPress={() => isDisponivel && setHorarioSelecionado(horario.horario)}
        disabled={!isDisponivel}
      >
        <View style={styles.horarioInfo}>
          <Text style={[styles.horarioTexto, !isDisponivel && styles.horarioTextoDisabled]}>{horario.horario}</Text>
          <Text style={[styles.tipoTexto, !isDisponivel && styles.horarioTextoDisabled]}>{horario.tipo}</Text>
        </View>

        <CheckBox
          label=""
          checked={isSelecionado}
          onPress={() => isDisponivel && setHorarioSelecionado(horario.horario)}
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
          <Text style={styles.titulo}>Horários disponíveis</Text>
          <Text style={styles.subtitulo}>{formatarData(data)}</Text>

          {carregando ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              <View style={styles.horariosContainer}>
                {horarios.length > 0 ? (
                  horarios.map(renderHorarioCard)
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Sem horários disponíveis para esta data.</Text>
                  </View>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Confirmar Agendamento"
                  onPress={handleConfirmarAgendamento}
                  disabled={!horarioSelecionado || salvando}
                  loading={salvando}
                />
              </View>
            </>
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
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
  emptyContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingTop: 8,
    paddingBottom: 20,
  },
});

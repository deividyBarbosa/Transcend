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
  const [erroTela, setErroTela] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const carregar = async () => {
        if (!psicologoId || !data) {
          setCarregando(false);
          return;
        }

        setCarregando(true);
        setErroTela(null);
        const res = await buscarHorariosDisponiveisPsicologo(psicologoId, data);
        const listaHorarios = res.sucesso && res.dados ? res.dados : [];
        setHorarios(listaHorarios);
        setHorarioSelecionado(atual => {
          if (!atual) return atual;
          const aindaDisponivel = listaHorarios.some(
            h => h.horario === atual && h.disponivel
          );
          return aindaDisponivel ? atual : null;
        });
        if (!res.sucesso) {
          setErroTela(res.erro || 'Nao foi possivel carregar os horarios.');
        }
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
      setErroTela('Por favor, selecione um horario.');
      return;
    }

    setErroTela(null);

    const { data: auth } = await supabase.auth.getUser();
    const pacienteId = auth.user?.id;
    if (!pacienteId) {
      setErroTela('Usuario nao autenticado. Faca login novamente.');
      return;
    }

    setSalvando(true);
    const resultado = await agendarSessaoPsicologica(pacienteId, psicologoId, data, horarioSelecionado);
    setSalvando(false);

    if (!resultado.sucesso) {
      setErroTela(resultado.erro || 'Nao foi possivel agendar a consulta.');
      return;
    }

    Alert.alert('Solicitacao enviada', 'A consulta foi solicitada. Aguarde a confirmacao do psicologo.', [
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
        onPress={() => {
          if (isDisponivel) {
            setHorarioSelecionado(horario.horario);
            setErroTela(null);
          }
        }}
        disabled={!isDisponivel}
      >
        <View style={styles.horarioInfo}>
          <Text style={[styles.horarioTexto, !isDisponivel && styles.horarioTextoDisabled]}>{horario.horario}</Text>
          <Text style={[styles.tipoTexto, !isDisponivel && styles.horarioTextoDisabled]}>{horario.tipo}</Text>
        </View>

        <CheckBox
          label=""
          checked={isSelecionado}
          onPress={() => {
            if (isDisponivel) {
              setHorarioSelecionado(horario.horario);
              setErroTela(null);
            }
          }}
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
          <Text style={styles.titulo}>Horarios disponiveis</Text>
          <Text style={styles.subtitulo}>{formatarData(data)}</Text>

          {erroTela ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{erroTela}</Text>
            </View>
          ) : null}

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
                    <Text style={styles.emptyText}>Sem horarios disponiveis para esta data.</Text>
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
  errorBox: {
    backgroundColor: '#FFF1F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#B91C1C',
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

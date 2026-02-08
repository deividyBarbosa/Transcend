// to-do: arrumar isso, acho que dá pra deixar mais legível

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import Header from '@/components/Header';
import MedicationCard from '@/components/MedicationCard';
import Calendar from '@/components/Calendar';
import DismissKeyboard from '@/components/DismissKeyboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { obterUsuarioAtual } from '@/services/auth';
import { buscarPlanosAtivos, buscarHistoricoAplicacoes } from '@/services/planoHormonal';
import type { PlanoHormonal, AplicacaoHormonal } from '@/types/planoHormonal';

export default function PlanoHormonalScreen() {
  const router = useRouter();

  const [planoAtual, setPlanoAtual] = useState<PlanoHormonal[]>([]);
  const [aplicacoes, setAplicacoes] = useState<AplicacaoHormonal[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const carregar = async () => {
        setCarregando(true);
        const usuario = await obterUsuarioAtual();
        if (!usuario) {
          setCarregando(false);
          return;
        }

        const [planosRes, aplicacoesRes] = await Promise.all([
          buscarPlanosAtivos(usuario.id),
          buscarHistoricoAplicacoes(usuario.id),
        ]);

        if (planosRes.sucesso && planosRes.dados) {
          setPlanoAtual(planosRes.dados);
        }

        if (aplicacoesRes.sucesso && aplicacoesRes.dados) {
          setAplicacoes(aplicacoesRes.dados);
        }

        setCarregando(false);
      };
      carregar();
    }, [])
  );

  // Extrair apenas a parte YYYY-MM-DD de data_aplicacao
  const extrairData = (dataAplicacao: string): string => {
    return dataAplicacao.substring(0, 10);
  };

  // Obter datas com aplicações para marcar no calendário
  const getMarkedDates = (): string[] => {
    const datas = new Set<string>();
    for (const app of aplicacoes) {
      if (app.data_aplicacao) {
        datas.add(extrairData(app.data_aplicacao));
      }
    }
    return Array.from(datas);
  };

  // Obter status por data para colorir marcações no calendário
  const getMarkedDatesStatus = (): { [date: string]: 'aplicado' | 'atrasado' | 'pendente' } => {
    const status: { [date: string]: 'aplicado' | 'atrasado' | 'pendente' } = {};

    // Agrupar aplicações por data
    const porData: { [data: string]: AplicacaoHormonal[] } = {};
    for (const app of aplicacoes) {
      if (!app.data_aplicacao) continue;
      const data = extrairData(app.data_aplicacao);
      if (!porData[data]) porData[data] = [];
      porData[data].push(app);
    }

    // Determinar status de cada dia
    Object.keys(porData).forEach(data => {
      const apps = porData[data];
      if (apps.every(a => a.status === 'aplicado')) {
        status[data] = 'aplicado';
      } else if (apps.some(a => a.status === 'atrasado')) {
        status[data] = 'atrasado';
      } else {
        status[data] = 'pendente';
      }
    });

    return status;
  };

  // Obter aplicações de um dia específico
  const getAplicacoesDoDia = (day: number): AplicacaoHormonal[] => {
    const ano = currentMonth.getFullYear();
    const mes = currentMonth.getMonth();
    const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return aplicacoes.filter(app => app.data_aplicacao?.startsWith(dataStr));
  };

  // Função para buscar plano por ID
  const getPlanoPorId = (planoId: string): PlanoHormonal | undefined => {
    return planoAtual.find(p => p.id === planoId);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedDay(null);
  };

  const handleDayPress = (day: number) => {
    setSelectedDay(day);
  };

  const handleRegistrarAplicacao = (planoId: string) => {
    const aplicacao = aplicacoesDoDia.find(app => app.plano_id === planoId);
    const plano = planoAtual.find(p => p.id === planoId);

    if (!plano) return;

    const ano = currentMonth.getFullYear();
    const mes = currentMonth.getMonth();
    const dataStr = selectedDay
      ? `${ano}-${String(mes + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
      : '';

    router.push({
      pathname: '/pessoa-trans/registrar-aplicacao',
      params: {
        planoId: plano.id,
        hormonio: plano.nome,
        data: aplicacao ? extrairData(aplicacao.data_aplicacao) : dataStr,
        horario: aplicacao?.horario_previsto ?? plano.horario_preferencial ?? '',
        dosagem: plano.dosagem + plano.unidade_dosagem,
        modoAplicacao: plano.modo_aplicacao,
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aplicado':
        return { name: 'checkmark-circle', color: '#4CAF50' };
      case 'atrasado':
        return { name: 'alert-circle', color: '#FF9800' };
      case 'pendente':
      default:
        return { name: 'ellipse-outline', color: colors.muted };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aplicado':
        return 'Aplicado';
      case 'atrasado':
        return 'Atrasado';
      case 'pendente':
      default:
        return 'Pendente';
    }
  };

  const formatarDataExibicao = (day: number) => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${day} de ${meses[currentMonth.getMonth()]}`;
  };

  const aplicacoesDoDia = selectedDay ? getAplicacoesDoDia(selectedDay) : [];

  if (carregando) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <DismissKeyboard>
        <View style={styles.container}>
          <Header title="Meu Plano Hormonal" showBackButton />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Plano Atual */}
            <Text style={styles.sectionTitle}>Plano Atual</Text>

            {planoAtual.map(item => {
              return (
                <View key={item.id}>
                  <MedicationCard
                    icon="medical-outline"
                    title={item.nome}
                    subtitle={`${item.dosagem}${item.unidade_dosagem}/${item.frequencia.toLowerCase()}`}
                  />
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => router.push(`/pessoa-trans/detalhes-hormonio?id=${item.id}`)}>
                      <Ionicons name="eye-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push({
                      pathname: '/pessoa-trans/editar-medicamento',
                      params: {
                        id: item.id,
                        nome: item.nome,
                        dosagem: item.dosagem,
                        unidadeDosagem: item.unidade_dosagem,
                        frequencia: item.frequencia,
                        modoAplicacao: item.modo_aplicacao,
                        horarioPreferencial: item.horario_preferencial ?? '',
                        observacoesMedicas: item.observacoes ?? '',
                      }
                    })}>
                      <Ionicons name="create-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            <MedicationCard
              variant="add"
              title="Adicionar medicamento"
              onPress={() => router.push('/pessoa-trans/editar-medicamento')}
            />

            {/* Histórico - Calendário */}
            <Text style={styles.sectionTitle}>Histórico de Aplicações</Text>

            <Calendar
              currentMonth={currentMonth}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
              onDayPress={handleDayPress}
              markedDates={getMarkedDates()}
              selectedDay={selectedDay ?? undefined}
              markedDatesStatus={getMarkedDatesStatus()}
            />

            {/* Lista de aplicações do dia selecionado */}
            {selectedDay && aplicacoesDoDia.length > 0 && (
              <View style={styles.dayDetailsCard}>
                <Text style={styles.dayDetailsTitle}>
                  {formatarDataExibicao(selectedDay)}
                </Text>

                {aplicacoesDoDia.map((app, index) => {
                  const statusIcon = getStatusIcon(app.status);
                  const plano = getPlanoPorId(app.plano_id);

                  if (!plano) return null;

                  return (
                    <View key={app.id || index} style={styles.aplicacaoItem}>
                      <View style={styles.aplicacaoHeader}>
                        <View style={styles.aplicacaoInfo}>
                          <Ionicons
                            name={statusIcon.name as any}
                            size={20}
                            color={statusIcon.color}
                          />
                          <Text style={styles.aplicacaoHormonio}>
                            {plano.nome}
                          </Text>
                        </View>
                        <Text style={styles.aplicacaoHorario}>
                          {app.horario_previsto ?? ''}
                        </Text>
                      </View>

                      <Text style={styles.aplicacaoDosagem}>
                        {plano.dosagem}{plano.unidade_dosagem}
                      </Text>

                      <View style={styles.aplicacaoStatus}>
                        <Text style={[
                          styles.aplicacaoStatusText,
                          { color: statusIcon.color }
                        ]}>
                          {getStatusText(app.status)}
                        </Text>

                        {app.status === 'pendente' && (
                          <TouchableOpacity
                            style={styles.registrarButton}
                            onPress={() => handleRegistrarAplicacao(plano.id)}
                          >
                            <Text style={styles.registrarButtonText}>Registrar</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {app.horario_aplicado && (
                        <Text style={styles.aplicacaoDetalhe}>
                          Aplicado às {app.horario_aplicado}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {selectedDay && aplicacoesDoDia.length === 0 && (
              <View style={styles.dayDetailsCard}>
                <Text style={styles.emptyText}>
                  Nenhuma aplicação programada para este dia
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </DismissKeyboard>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
    marginTop: 20,
  },
  dayDetailsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  dayDetailsTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  aplicacaoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  aplicacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  aplicacaoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aplicacaoHormonio: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  aplicacaoHorario: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  aplicacaoDosagem: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginLeft: 28,
    marginBottom: 8,
  },
  aplicacaoStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 28,
  },
  aplicacaoStatusText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  aplicacaoDetalhe: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginLeft: 28,
    marginTop: 4,
  },
  registrarButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  registrarButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.white,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 16,
    position: 'absolute',
    right: 16,
    top: 16,
  },
});

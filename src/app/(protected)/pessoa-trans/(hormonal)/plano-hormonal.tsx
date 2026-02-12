// to-do: arrumar isso, acho que dá pra deixar mais legível

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import Header from '@/components/Header';
import Button from '@/components/Button';
import MedicationCard from '@/components/MedicationCard';
import Calendar from '@/components/Calendar';
import DismissKeyboard from '@/components/DismissKeyboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EVOLUCAO_MOCK } from '@/mocks/mockPlanoHormonal';
import EvolutionChart from '@/components/EvolutionChart';
import { supabase } from '@/utils/supabase';
import { buscarPlanosAtivos, buscarHistoricoAplicacoes } from '@/services/planoHormonal';
import type { PlanoHormonal, AplicacaoHormonal } from '@/types/planoHormonal';

export default function PlanoHormonalScreen() {
  const router = useRouter();

  const [planoAtual, setPlanoAtual] = useState<PlanoHormonal[]>([]);
  const [todosPlanos, setTodosPlanos] = useState<PlanoHormonal[]>([]);
  const [aplicacoes, setAplicacoes] = useState<AplicacaoHormonal[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const carregar = async () => {
        setCarregando(true);
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const resultado = await buscarPlanosAtivos(data.user.id);
          if (resultado.sucesso && resultado.dados) {
            setPlanoAtual(resultado.dados);
          }
          // Buscar todos os planos (ativos e inativos) para lookup de nomes
          const { data: planosData } = await supabase
            .from('planos_hormonais')
            .select('*')
            .eq('usuario_id', data.user.id);
          if (planosData) {
            setTodosPlanos(planosData as PlanoHormonal[]);
          }
          const resultadoAplicacoes = await buscarHistoricoAplicacoes(data.user.id);
          if (resultadoAplicacoes.sucesso && resultadoAplicacoes.dados) {
            setAplicacoes(resultadoAplicacoes.dados);
          }
        }
        setCarregando(false);
      };
      carregar();
    }, [])
  );

  // Função para buscar plano por ID (busca em todos os planos, não só ativos)
  const getPlanoPorId = (planoId: string) => {
    return todosPlanos.find((h: PlanoHormonal) => h.id === planoId);
  };

  // Obter datas com aplicações para marcar no calendário
  const getMarkedDates = () => {
    return [...new Set(aplicacoes.map(app => app.data_aplicacao.split('T')[0]))];
  };

  // Obter status por data para colorir o calendário
  const getMarkedDatesStatus = () => {
    const status: { [date: string]: 'aplicado' | 'atrasado' | 'pendente' } = {};

    const porData = aplicacoes.reduce((acc, app) => {
      const data = app.data_aplicacao.split('T')[0];
      if (!acc[data]) acc[data] = [];
      acc[data].push(app);
      return acc;
    }, {} as { [data: string]: AplicacaoHormonal[] });

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
  const getAplicacoesDoDia = (day: number) => {
    const ano = currentMonth.getFullYear();
    const mes = currentMonth.getMonth();
    const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return aplicacoes.filter(app => app.data_aplicacao.split('T')[0] === dataStr);
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

  const formatarAtraso = (minutos: number) => {
    if (minutos === 0) return 'No horário';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas > 0) return `Atraso ${horas}h ${mins}m`;
    return `Atraso ${mins}m`;
  };

  const formatarDataExibicao = (day: number) => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${day} de ${meses[currentMonth.getMonth()]}`;
  };

  const aplicacoesDoDia = selectedDay ? getAplicacoesDoDia(selectedDay) : [];

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

            {/* Histórico - Agora com Calendário */}
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
            {selectedDay && (
              <>
                <Text style={styles.dayDetailsTitle}>
                  {formatarDataExibicao(selectedDay)}
                </Text>

                {aplicacoesDoDia.length === 0 ? (
                  <View style={styles.dayDetailsCard}>
                    <Text style={styles.emptyText}>
                      Nenhuma aplicação registrada para este dia
                    </Text>
                  </View>
                ) : (
                  aplicacoesDoDia.map((app) => {
                    const statusIcon = getStatusIcon(app.status);
                    const hormonio = getPlanoPorId(app.plano_id);
                    const hormonioInativo = !hormonio || !hormonio.ativo;
                    const horario = app.horario_aplicado || app.horario_previsto;
                    const horarioExibicao = horario
                      ? horario.split(':').slice(0, 2).join(':')
                      : '--:--';

                    return (
                      <TouchableOpacity
                        key={app.id}
                        style={[styles.historicoItem, hormonioInativo && styles.historicoItemInativo]}
                        onPress={() => {
                          if (hormonio && hormonio.ativo) {
                            router.push(`/pessoa-trans/detalhes-hormonio?id=${hormonio.id}`);
                            return;
                          }
                          Alert.alert(
                            'Hormônio inativo',
                            'Este hormônio foi removido do seu plano e não pode mais ser editado.'
                          );
                        }}
                        activeOpacity={hormonioInativo ? 1 : 0.7}
                      >
                        <View style={[
                          styles.historicoIcon,
                          { backgroundColor: app.status === 'aplicado' ? '#E8F5E9' : app.status === 'atrasado' ? '#FFF3E0' : '#F5F5F5' }
                        ]}>
                          <Ionicons
                            name={statusIcon.name as any}
                            size={24}
                            color={statusIcon.color}
                          />
                        </View>
                        <View style={styles.historicoContent}>
                          <Text style={styles.historicoNome}>
                            {hormonio?.nome ?? 'Hormônio removido'}
                          </Text>
                          {hormonioInativo && (
                            <View style={styles.inativoBadge}>
                              <Text style={styles.inativoBadgeText}>Inativo</Text>
                            </View>
                          )}
                          <Text style={styles.historicoDetalhe}>
                            {horarioExibicao} • {formatarAtraso(app.atraso)}
                          </Text>
                        </View>
                        {!hormonioInativo && (
                          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </>
            )}

            {/* Evolução */}

            <Text style={styles.sectionTitle}>Evolução</Text>

            <EvolutionChart
              currentLevel={EVOLUCAO_MOCK.testosterona.nivelAtual}
              percentageChange={EVOLUCAO_MOCK.testosterona.percentualMudanca}
              data={EVOLUCAO_MOCK.testosterona.dados}
              labels={EVOLUCAO_MOCK.testosterona.labels}
              onViewDetails={() => router.push('/pessoa-trans/estatisticas')} 
            />
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
    marginTop: 4,
    marginBottom: 8,
  },
  dayDetailsTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  historicoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  historicoItemInativo: {
    opacity: 0.75,
  },
  historicoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historicoContent: {
    flex: 1,
  },
  historicoNome: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
    marginBottom: 2,
  },
  inativoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  inativoBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
  },
  historicoDetalhe: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
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


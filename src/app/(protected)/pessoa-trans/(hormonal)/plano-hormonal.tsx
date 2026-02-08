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
import { APLICACOES_MOCK, calcularEstatisticas, EVOLUCAO_MOCK } from '@/mocks/mockPlanoHormonal';
import EvolutionChart from '@/components/EvolutionChart';
import { supabase } from '@/utils/supabase';
import { buscarPlanosAtivos } from '@/services/planoHormonal';
import type { PlanoHormonal } from '@/types/planoHormonal';

const getMarkedDatesStatus = () => {
  const status: { [date: string]: 'aplicado' | 'atrasado' | 'pendente' } = {};
  
  // Agrupar aplicações por data
  const porData = APLICACOES_MOCK.reduce((acc, app) => {
    if (!acc[app.data]) acc[app.data] = [];
    acc[app.data].push(app);
    return acc;
  }, {} as { [data: string]: typeof APLICACOES_MOCK });
  
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

export default function PlanoHormonalScreen() {
  const router = useRouter();

  const [planoAtual, setPlanoAtual] = useState<PlanoHormonal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const stats = calcularEstatisticas();

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
        }
        setCarregando(false);
      };
      carregar();
    }, [])
  );

  // Função para buscar hormônio por ID (mock, para o calendário)
  const getHormonioPorId = (hormonioId: string) => {
    return planoAtual.find((h: PlanoHormonal) => h.id === hormonioId);
  };

  // Obter datas com aplicações para marcar no calendário
  const getMarkedDates = () => {
    return APLICACOES_MOCK.map(app => app.data);
  };

  // Obter aplicações de um dia específico
  const getAplicacoesDoDia = (day: number) => {
    const ano = currentMonth.getFullYear();
    const mes = currentMonth.getMonth();
    const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return APLICACOES_MOCK.filter(app => app.data === dataStr);
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

  const handleRegistrarAplicacao = (nomeHormonio: string) => {
    const aplicacao = aplicacoesDoDia.find(app => {
      const h = getHormonioPorId(app.hormonioId);
      return h?.nome === nomeHormonio;
    });
    
    const hormonio = planoAtual.find(h => h.nome === nomeHormonio);
    
    if (!aplicacao || !hormonio) return;
    
    router.push({
      pathname: '/pessoa-trans/registrar-aplicacao',
      params: {
        planoId: hormonio.id,
        hormonio: nomeHormonio,
        data: aplicacao.data,
        horario: aplicacao.horarioPrevisto,
        dosagem: hormonio.dosagem + hormonio.unidade_dosagem,
        modoAplicacao: hormonio.modo_aplicacao,
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
            {selectedDay && aplicacoesDoDia.length > 0 && (
              <View style={styles.dayDetailsCard}>
                <Text style={styles.dayDetailsTitle}>
                  {formatarDataExibicao(selectedDay)}
                </Text>

                {aplicacoesDoDia.map((app, index) => {
                  const statusIcon = getStatusIcon(app.status);
                  const hormonio = getHormonioPorId(app.hormonioId);
                  
                  if (!hormonio) return null;
                  
                  return (
                    <View key={index} style={styles.aplicacaoItem}>
                      <View style={styles.aplicacaoHeader}>
                        <View style={styles.aplicacaoInfo}>
                          <Ionicons 
                            name={statusIcon.name as any} 
                            size={20} 
                            color={statusIcon.color} 
                          />
                          <Text style={styles.aplicacaoHormonio}>
                            {hormonio.nome}
                          </Text>
                        </View>
                        <Text style={styles.aplicacaoHorario}>{app.horarioPrevisto}</Text>
                      </View>

                      <Text style={styles.aplicacaoDosagem}>
                        {hormonio.dosagem}{hormonio.unidade_dosagem}
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
                            onPress={() => handleRegistrarAplicacao(hormonio.nome)}
                          >
                            <Text style={styles.registrarButtonText}>Registrar</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {app.horarioAplicado && (
                        <Text style={styles.aplicacaoDetalhe}>
                          Aplicado às {app.horarioAplicado}
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
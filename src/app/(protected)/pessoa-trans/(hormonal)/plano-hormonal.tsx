/* back-enders heeeeeelp todos os dados aqui são fakes fixos obviamente */
// to-do: gráfico de evolução

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import Header from '@/components/Header';
import Button from '@/components/Button';
import MedicationCard from '@/components/MedicationCard';
import Calendar from '@/components/Calendar';
import DismissKeyboard from '@/components/DismissKeyboard';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock de aplicações com estados
const APLICACOES_MOCK = [
  // Janeiro 2026
  { 
    data: '2026-01-15', 
    hormonio: 'Testosterona', 
    dosagem: '20mg', 
    horario: '08:00',
    status: 'atrasado', // aplicado, pendente, atrasado
    dataHoraAplicacao: '2026-01-15T08:15:00',
  },
  { 
    data: '2026-01-15', 
    hormonio: 'Finasterida', 
    dosagem: '1mg', 
    horario: '22:00',
    status: 'aplicado',
    dataHoraAplicacao: '2026-01-15T22:05:00',
  },
  { 
    data: '2026-01-22', 
    hormonio: 'Testosterona', 
    dosagem: '20mg', 
    horario: '08:00',
    status: 'aplicado',
    dataHoraAplicacao: '2026-01-22T08:30:00',
  },
  { 
    data: '2026-01-22', 
    hormonio: 'Finasterida', 
    dosagem: '1mg', 
    horario: '22:00',
    status: 'aplicado',
    dataHoraAplicacao: '2026-01-22T22:10:00',
  },
  { 
    data: '2026-01-29', 
    hormonio: 'Testosterona', 
    dosagem: '20mg', 
    horario: '08:00',
    status: 'aplicado',
    dataHoraAplicacao: '2026-01-29T08:00:00',
  },
  { 
    data: '2026-01-29', 
    hormonio: 'Finasterida', 
    dosagem: '1mg', 
    horario: '22:00',
    status: 'aplicado',
    dataHoraAplicacao: '2026-01-29T22:00:00',
  },
  // Fevereiro 2026 - testando
  { 
    data: '2026-02-05', 
    hormonio: 'Testosterona', 
    dosagem: '20mg', 
    horario: '08:00',
    status: 'pendente',
  },
  { 
    data: '2026-02-05', 
    hormonio: 'Finasterida', 
    dosagem: '1mg', 
    horario: '22:00',
    status: 'pendente',
  },
];

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

  const [planoAtual] = useState([
    { id: '1', nome: 'Testosterona', dose: '20mg/semana' },
    { id: '2', nome: 'Finasterida', dose: '1mg/dia' },
  ]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const parseDose = (dose: string) => {
    const match = dose.match(/^(\d+\.?\d*)([a-zçõãá()]+)\/(.+)$/i);
    if (match) {
      return {
        quantidade: match[1],
        unidade: match[2],
        frequencia: match[3],
      };
    }
    return { quantidade: '', unidade: '', frequencia: '' };
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
    setTimeout(() => {
      // teste teste
  }, 1);
  };

  const handleRegistrarAplicacao = (hormonio: string) => {
    // Buscar dados completos da aplicação
    const aplicacao = aplicacoesDoDia.find(app => app.hormonio === hormonio);
    
    if (!aplicacao) return;
    
    router.push({
      pathname: '/pessoa-trans/registrar-aplicacao',
      params: {
        hormonio: aplicacao.hormonio,
        data: aplicacao.data,
        horario: aplicacao.horario,
        dosagem: aplicacao.dosagem,
        modoAplicacao: 'Injetável', // TO-DO: pegar do plano quando tiver no banco
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
              const parsed = parseDose(item.dose);
              return (
                <MedicationCard
                  key={item.id}
                  icon="medical-outline"
                  title={item.nome}
                  subtitle={item.dose}
                  onEdit={() => router.push({
                    pathname: '/pessoa-trans/hormonal/editar-medicamento',
                    params: {
                      id: item.id,
                      nome: item.nome,
                      ...parsed
                    }
                  })}
                />
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
                            {app.hormonio}
                          </Text>
                        </View>
                        <Text style={styles.aplicacaoHorario}>{app.horario}</Text>
                      </View>

                      <Text style={styles.aplicacaoDosagem}>{app.dosagem}</Text>
                      
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
                            onPress={() => handleRegistrarAplicacao(app.hormonio)}
                          >
                            <Text style={styles.registrarButtonText}>Registrar</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {app.dataHoraAplicacao && (
                        <Text style={styles.aplicacaoDetalhe}>
                          Aplicado às {app.dataHoraAplicacao.split('T')[1].substring(0, 5)}
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

            <View style={styles.evolutionCard}>
              <Text style={styles.level}>550 ng/dL</Text>
              <Text style={styles.evolutionText}>Últimos 6 meses +15%</Text>
              
              <View style={styles.graphPlaceholder}>
                <Text style={styles.graphText}>📊 Gráfico em desenvolvimento</Text>
              </View>
              
              <Button 
                title="Ver Estatísticas"
                onPress={() => Alert.alert('Estatísticas', 'Funcionalidade em desenvolvimento')}
              />
            </View>
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
  evolutionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  level: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text,
  },
  evolutionText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 12,
  },
  graphPlaceholder: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginVertical: 20,
  },
  graphText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
});
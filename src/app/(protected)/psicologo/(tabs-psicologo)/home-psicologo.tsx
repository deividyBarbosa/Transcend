import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { colors } from '@/theme/colors';
import { PsychologistHeader } from '@/components/psicologo/PsicologoHeader';
import PsicologoCalendar from '@/components/psicologo/PsicologoCalendar';
import Button from '@/components/Button';
import { ConsultaCard } from '@/components/psicologo/ConsultaCard';
import { supabase } from '@/utils/supabase';
import { listarSessoesPsicologo, listarSolicitacoesPsicologo } from '@/services/agendamento';

interface Consulta {
  id: string;
  pacientName: string;
  dataConsulta: Date;
  horaInicio: string;
  horaFim: string;
  status: 'agendada' | 'concluida' | 'cancelada';
}

const statusToCardStatus = (status: string | null): 'agendada' | 'concluida' | 'cancelada' => {
  if (status === 'realizada') return 'concluida';
  if (status === 'cancelada') return 'cancelada';
  return 'agendada';
};

export default function PsicologoHome() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const carregarConsultas = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) {
        setConsultas([]);
        setIsLoading(false);
        return;
      }

      const [resultado, solicitacoesRes] = await Promise.all([
        listarSessoesPsicologo(userId),
        listarSolicitacoesPsicologo(userId),
      ]);

      if (solicitacoesRes.sucesso && solicitacoesRes.dados) {
        setPendingRequestsCount(solicitacoesRes.dados.length);
      } else {
        setPendingRequestsCount(0);
      }

      if (!resultado.sucesso || !resultado.dados) {
        setConsultas([]);
        setIsLoading(false);
        return;
      }

      const parsed = resultado.dados.map(sessao => {
        const dt = new Date(sessao.data_sessao);
        const inicio = `${String(dt.getUTCHours()).padStart(2, '0')}:${String(dt.getUTCMinutes()).padStart(2, '0')}`;
        const duracao = sessao.duracao_minutos || 60;
        const fimDt = new Date(dt.getTime() + duracao * 60 * 1000);
        const fim = `${String(fimDt.getUTCHours()).padStart(2, '0')}:${String(fimDt.getUTCMinutes()).padStart(2, '0')}`;

        return {
          id: sessao.id,
          pacientName: sessao.paciente_nome,
          dataConsulta: dt,
          horaInicio: inicio,
          horaFim: fim,
          status: statusToCardStatus(sessao.status),
        } as Consulta;
      });

      setConsultas(parsed);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarConsultas();
    }, [carregarConsultas])
  );

  const markedDates = useMemo(() => {
    return consultas.map(consulta => {
      const year = consulta.dataConsulta.getUTCFullYear();
      const month = String(consulta.dataConsulta.getUTCMonth() + 1).padStart(2, '0');
      const day = String(consulta.dataConsulta.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
  }, [consultas]);

  const proximasConsultas = useMemo(() => {
    const agora = new Date();
    return consultas
      .filter(consulta => consulta.status === 'agendada')
      .filter(consulta => consulta.dataConsulta.getTime() >= agora.getTime())
      .sort((a, b) => a.dataConsulta.getTime() - b.dataConsulta.getTime())
      .slice(0, 3);
  }, [consultas]);

  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  }, []);

  const handleDayPress = useCallback(() => {
    router.push('/psicologo/consultas/consultas');
  }, [router]);

  const handleSolicitacoesPress = useCallback(() => {
    router.push('/psicologo/solicitacoes');
  }, [router]);

  const handleDisponibilidadePress = useCallback(() => {
    router.push('/psicologo/disponibilidade');
  }, [router]);

  const handleVerMaisPress = useCallback(() => {
    router.push('/psicologo/consultas/consultas');
  }, [router]);

  const handleListaCompletaPress = useCallback(() => {
    router.push('/psicologo/atendimentos');
  }, [router]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await carregarConsultas();
    setIsRefreshing(false);
  }, [carregarConsultas]);

  return (
    <View style={styles.container}>
      <PsychologistHeader pendingRequestsCount={pendingRequestsCount} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.actionsSection}>
          <Button
            title="Acompanhar solicitações"
            onPress={handleSolicitacoesPress}
            loading={isLoading}
            style={styles.primaryButton}
          />
          <Button
            title="Gerenciar disponibilidade"
            onPress={handleDisponibilidadePress}
            style={styles.secondaryButton}
          />
        </View>

        <View style={styles.calendarSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Agenda</Text>
            <Text style={styles.sectionSubtitle}>{proximasConsultas.length} consulta(s) próxima(s)</Text>
          </View>

          <PsicologoCalendar
            currentMonth={currentMonth}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            onDayPress={handleDayPress}
            markedDates={markedDates}
          />
        </View>

        <View style={styles.consultasSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximas consultas</Text>
            <TouchableOpacity onPress={handleVerMaisPress}>
              <Text style={styles.verMaisText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : proximasConsultas.length > 0 ? (
            <View style={styles.consultasList}>
              {proximasConsultas.map(consulta => (
                <ConsultaCard
                  key={consulta.id}
                  pacientName={consulta.pacientName}
                  dataConsulta={consulta.dataConsulta}
                  horaInicio={consulta.horaInicio}
                  horaFim={consulta.horaFim}
                  status={consulta.status}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhuma consulta agendada</Text>
            </View>
          )}

          <View style={styles.buttonsContainer}>
            <Button title="Ver mais consultas" onPress={handleVerMaisPress} style={styles.secondaryButton} />
            <Button
              title="Lista completa de atendimentos"
              onPress={handleListaCompletaPress}
              style={styles.tertiaryButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  actionsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  primaryButton: {
    height: 48,
    borderRadius: 12,
  },
  calendarSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'black',
  },
  verMaisText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary || '#D65C73',
  },
  consultasSection: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  consultasList: {
    gap: 12,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: 'black',
  },
  buttonsContainer: {
    marginTop: 20,
    gap: 12,
  },
  secondaryButton: {
    height: 48,
    borderRadius: 12,
  },
  tertiaryButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#cf98a0',
  },
});

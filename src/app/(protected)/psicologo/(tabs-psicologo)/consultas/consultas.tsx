import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/theme/colors';
import { AgendamentoCard } from '@/components/psicologo/AgendamentoCard';
import { supabase } from '@/utils/supabase';
import { listarSessoesPsicologo } from '@/services/agendamento';

type TabType = 'proximas' | 'passadas' | 'canceladas';

interface Consulta {
  id: string;
  patientName: string;
  sessionType: string;
  date: string;
  time: string;
  badge?: 'HOJE' | 'AMANHA' | null;
  statusRaw: string;
  dataSessao: Date;
}

const formatarData = (date: Date) => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

const extractHourMinute = (dateTime: string) => {
  const match = dateTime.match(/(?:T|\s)(\d{2}):(\d{2})/);
  if (!match) return '00:00';
  return `${match[1]}:${match[2]}`;
};

const addMinutes = (time: string, minutes: number) => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const mm = (total % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

const calcularBadge = (dataSessao: Date): 'HOJE' | 'AMANHA' | null => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);

  const data = new Date(dataSessao);
  data.setHours(0, 0, 0, 0);

  if (data.getTime() === hoje.getTime()) return 'HOJE';
  if (data.getTime() === amanha.getTime()) return 'AMANHA';
  return null;
};

export default function Consultas() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('proximas');
  const [isLoading, setIsLoading] = useState(false);
  const [todasConsultas, setTodasConsultas] = useState<Consulta[]>([]);

  const carregarConsultas = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) {
        setTodasConsultas([]);
        setIsLoading(false);
        return;
      }

      const resultado = await listarSessoesPsicologo(userId);
      if (!resultado.sucesso || !resultado.dados) {
        setTodasConsultas([]);
        setIsLoading(false);
        return;
      }

      const consultas = resultado.dados.map(sessao => {
        const data = new Date(sessao.data_sessao);
        const inicio = extractHourMinute(sessao.data_sessao);
        const duracao = sessao.duracao_minutos || 60;
        const fim = addMinutes(inicio, duracao);

        const modalidade = sessao.modalidade ? String(sessao.modalidade) : 'Online';

        return {
          id: sessao.id,
          patientName: sessao.paciente_nome,
          sessionType: `${modalidade} - Sessão`,
          date: formatarData(data),
          time: `${inicio} - ${fim}`,
          badge: calcularBadge(data),
          statusRaw: (sessao.status || 'agendada').toLowerCase(),
          dataSessao: data,
        } as Consulta;
      });

      setTodasConsultas(consultas);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarConsultas();
    }, [carregarConsultas])
  );

  const consultas = useMemo(() => {
    const agora = new Date();

    switch (activeTab) {
      case 'proximas': {
        const base = todasConsultas
          .filter(c => ['confirmada', 'remarcada'].includes(c.statusRaw))
          .filter(c => c.dataSessao.getTime() >= agora.getTime())
          .sort((a, b) => a.dataSessao.getTime() - b.dataSessao.getTime());

        // Evita exibir sessÃµes duplicadas no mesmo horÃ¡rio (legado de dados antigos).
        const unicasPorHorario = new Map<string, Consulta>();
        base.forEach(consulta => {
          const key = `${consulta.dataSessao.toISOString()}|${consulta.time}`;
          if (!unicasPorHorario.has(key)) {
            unicasPorHorario.set(key, consulta);
          }
        });

        return Array.from(unicasPorHorario.values());
      }
      case 'passadas':
        return todasConsultas
          .filter(c => c.statusRaw === 'realizada' || c.dataSessao.getTime() < agora.getTime())
          .filter(c => c.statusRaw !== 'cancelada')
          .sort((a, b) => b.dataSessao.getTime() - a.dataSessao.getTime());
      case 'canceladas':
        return todasConsultas
          .filter(c => c.statusRaw === 'cancelada')
          .sort((a, b) => b.dataSessao.getTime() - a.dataSessao.getTime());
      default:
        return [];
    }
  }, [activeTab, todasConsultas]);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const renderConsultaCard = useCallback(
    ({ item }: { item: Consulta }) => (
      <AgendamentoCard
        patientName={item.patientName}
        sessionType={item.sessionType}
        date={item.date}
        time={item.time}
        badge={item.badge}
        onPress={() => router.push(`/psicologo/consultas/detalhes-consulta?id=${item.id}`)}
      />
    ),
    [router]
  );

  const renderEmptyList = useCallback(() => {
    const emptyMessages = {
      proximas: 'Nenhuma consulta próxima',
      passadas: 'Nenhuma consulta passada',
      canceladas: 'Nenhuma consulta cancelada',
    };

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessages[activeTab]}</Text>
      </View>
    );
  }, [activeTab]);

  const keyExtractor = useCallback((item: Consulta) => item.id, []);

  const renderTabButton = useCallback(
    (tab: TabType, label: string) => (
      <TouchableOpacity
        key={tab}
        style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
        onPress={() => setActiveTab(tab)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{label}</Text>
      </TouchableOpacity>
    ),
    [activeTab]
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Minhas Consultas</Text>

        <View style={styles.backButton} />
      </View>

      <View style={styles.tabsContainer}>
        {renderTabButton('proximas', 'Próximas')}
        {renderTabButton('passadas', 'Passadas')}
        {renderTabButton('canceladas', 'Canceladas')}
      </View>

      <FlatList
        data={consultas}
        renderItem={renderConsultaCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#FFE8E8',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999999',
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D85D7A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  separator: {
    height: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
});

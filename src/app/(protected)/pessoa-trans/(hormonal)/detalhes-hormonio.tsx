// se der tempo vou refatorar esse depois

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import DetalhesAplicacaoModal from '@/components/DetalhesAplicacaoModal';
import { supabase } from '@/utils/supabase';
import { buscarHistoricoAplicacoes, buscarProximasAplicacoes } from '@/services/planoHormonal';
import type { PlanoHormonal, AplicacaoHormonal, ProximaAplicacao } from '@/types/planoHormonal';

const FREQUENCIA_PARA_DIAS: Record<string, number> = {
  'Diária': 1,
  'Semanal': 7,
  'Quinzenal': 15,
  'Mensal': 30,
};

export default function DetalhesHormonioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const planoId = params.id as string;

  const [hormonio, setHormonio] = useState<PlanoHormonal | null>(null);
  const [historico, setHistorico] = useState<AplicacaoHormonal[]>([]);
  const [proximaAplicacao, setProximaAplicacao] = useState<{ data: string; diasRestantes: number } | null>(null);
  const [stats, setStats] = useState({ taxaAdesao: 0, noHorario: 0, atrasadas: 0, atrasoMedio: 0 });
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const carregar = async () => {
        setCarregando(true);
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user || !planoId) {
          setCarregando(false);
          return;
        }

        // Buscar plano por ID
        const { data: planoData } = await supabase
          .from('planos_hormonais')
          .select('*')
          .eq('id', planoId)
          .eq('usuario_id', userData.user.id)
          .single();

        if (planoData) {
          setHormonio(planoData as PlanoHormonal);
        }

        // Buscar histórico de aplicações
        const resultado = await buscarHistoricoAplicacoes(userData.user.id, planoId, 10);
        if (resultado.sucesso && resultado.dados) {
          setHistorico(resultado.dados);

          // Calcular estatísticas a partir do histórico real
          const apps = resultado.dados;
          const aplicadas = apps.filter(a => a.status === 'aplicado' || a.status === 'atrasado');
          const noHorario = apps.filter(a => a.status === 'aplicado' && a.atraso === 0).length;
          const atrasadas = apps.filter(a => a.status === 'atrasado').length;
          const totalAtrasos = apps.filter(a => a.atraso > 0).reduce((sum, a) => sum + a.atraso, 0);
          const atrasoMedio = atrasadas > 0 ? Math.round(totalAtrasos / atrasadas) : 0;
          const taxaAdesao = aplicadas.length > 0 ? Math.round((noHorario / aplicadas.length) * 100) : 100;

          setStats({ taxaAdesao, noHorario, atrasadas, atrasoMedio });
        }

        // Calcular próxima aplicação
        if (planoData) {
          const freqDias = FREQUENCIA_PARA_DIAS[planoData.frequencia] || 1;
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          let proximaData: Date;

          // Buscar última aplicação
          const { data: ultimaApp } = await supabase
            .from('aplicacoes_hormonais')
            .select('data_aplicacao')
            .eq('plano_id', planoId)
            .eq('usuario_id', userData.user.id)
            .order('data_aplicacao', { ascending: false })
            .limit(1)
            .single();

          if (ultimaApp) {
            proximaData = new Date(ultimaApp.data_aplicacao);
            proximaData.setDate(proximaData.getDate() + freqDias);
          } else {
            proximaData = new Date(planoData.data_inicio);
          }
          proximaData.setHours(0, 0, 0, 0);

          const diffMs = proximaData.getTime() - hoje.getTime();
          const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          setProximaAplicacao({
            data: proximaData.toISOString().split('T')[0],
            diasRestantes,
          });
        }

        setCarregando(false);
      };
      carregar();
    }, [planoId])
  );

  const handleEditar = () => {
    if (!hormonio) return;
    router.push({
      pathname: '/pessoa-trans/editar-medicamento',
      params: {
        id: hormonio.id,
        nome: hormonio.nome,
        dosagem: hormonio.dosagem,
        unidadeDosagem: hormonio.unidade_dosagem,
        frequencia: hormonio.frequencia,
        modoAplicacao: hormonio.modo_aplicacao,
        horarioPreferencial: hormonio.horario_preferencial ?? '',
        observacoesMedicas: hormonio.observacoes ?? '',
      }
    });
  };

  const handleRegistrarAplicacao = () => {
    if (!hormonio) return;
    router.push({
      pathname: '/pessoa-trans/registrar-aplicacao',
      params: {
        planoId: hormonio.id,
        hormonio: hormonio.nome,
        data: proximaAplicacao?.data || new Date().toISOString().split('T')[0],
        horario: hormonio.horario_preferencial || '08:00',
        modoAplicacao: hormonio.modo_aplicacao,
      }
    });
  };

  const formatarData = (dataStr: string) => {
    const [ano, mes, dia] = dataStr.split('-');
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${dia} ${meses[parseInt(mes) - 1]}`;
  };

  const formatarDataCompleta = (dataStr: string) => {
    const [ano, mes, dia] = dataStr.split('-');
    const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatarAtraso = (minutos: number) => {
    if (minutos === 0) return 'No horário';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas > 0) {
      return `Atraso ${horas}h ${mins}m`;
    }
    return `Atraso ${mins}m`;
  };

  const getStatusIcon = (status: string) => {
    return status === 'aplicado' 
      ? { name: 'checkmark-circle', color: '#4CAF50' }
      : { name: 'alert-circle', color: '#FF9800' };
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [aplicacaoSelecionada, setAplicacaoSelecionada] = useState<AplicacaoHormonal | null>(null);

  if (carregando) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <Header title="Carregando..." showBackButton />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!hormonio) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <Header title="Hormônio" showBackButton />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontFamily: fonts.regular, fontSize: 16, color: colors.muted, textAlign: 'center' }}>
              Hormônio não encontrado.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

return (
  <>
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Header
          title={hormonio.nome}
          showBackButton
          rightIcon={
            <TouchableOpacity onPress={handleEditar}>
              <Ionicons name="create-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          }
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Card de Informações Principais */}
          <View style={styles.mainCard}>
            <View style={styles.mainCardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="medical" size={28} color={colors.primary} />
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>ATIVO</Text>
              </View>
            </View>

            <Text style={styles.label}>Dosagem Atual</Text>
            <Text style={styles.dosagem}>{hormonio.dosagem}{hormonio.unidade_dosagem}/{hormonio.frequencia.toLowerCase()}</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="fitness-outline" size={16} color={colors.muted} />
                <Text style={styles.infoText}>{hormonio.modo_aplicacao}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={16} color={colors.muted} />
                <Text style={styles.infoText}>{hormonio.horario_preferencial || '--:--'}</Text>
              </View>
            </View>
          </View>

          {/* Próxima Aplicação */}
          {proximaAplicacao && (
            <>
              <Text style={styles.sectionTitle}>Próxima Aplicação</Text>
              <View style={styles.nextCard}>
                <View style={styles.nextCardContent}>
                  <Text style={styles.nextDate}>
                    {formatarDataCompleta(proximaAplicacao.data)}
                  </Text>
                  <Text style={styles.nextCountdown}>
                    {proximaAplicacao.diasRestantes <= 0
                      ? 'Atrasada!'
                      : proximaAplicacao.diasRestantes === 1
                        ? 'Amanhã'
                        : `Em ${proximaAplicacao.diasRestantes} dias`}
                  </Text>
                  <Text style={styles.nextReminder}>
                    Prepare sua dose para as {hormonio.horario_preferencial || '08:00'}
                  </Text>
                </View>
                <Button
                  title="Registrar"
                  onPress={handleRegistrarAplicacao}
                  style={styles.registrarButton}
                />
              </View>
            </>
          )}

          {/* Estatísticas */}
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsLabel}>Aderência Geral</Text>
              <Text style={styles.statsPercentage}>{stats.taxaAdesao}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${stats.taxaAdesao}%` }]} />
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>No horário</Text>
                <Text style={styles.statValue}>{stats.noHorario}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Atrasadas</Text>
                <Text style={[styles.statValue, { color: '#FF9800' }]}>
                  {stats.atrasadas}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Atraso médio</Text>
                <Text style={styles.statValue}>{stats.atrasoMedio}m</Text>
              </View>
            </View>
          </View>

          {/* Histórico */}
          <View style={styles.historicoHeader}>
            <Text style={styles.sectionTitle}>Histórico</Text>
            <TouchableOpacity>
              <Text style={styles.verTudo}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registrarButtonContainer}>
            <Button
              title="+ Registrar Aplicação"
              onPress={handleRegistrarAplicacao}
            />
          </View>

          {historico.length === 0 && (
            <View style={styles.observacoesCard}>
              <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center' }}>
                Nenhuma aplicação registrada ainda
              </Text>
            </View>
          )}

          {historico.map((item) => {
            const statusIcon = getStatusIcon(item.status);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.historicoItem}
                onPress={() => {
                  setAplicacaoSelecionada(item);
                  setModalVisible(true);
                }}
              >
                <View style={[
                  styles.historicoIcon,
                  { backgroundColor: item.status === 'aplicado' ? '#E8F5E9' : '#FFF3E0' }
                ]}>
                  <Ionicons
                    name={statusIcon.name as any}
                    size={24}
                    color={statusIcon.color}
                  />
                </View>
                <View style={styles.historicoContent}>
                  <Text style={styles.historicoData}>{formatarData(item.data_aplicacao)}</Text>
                  <Text style={styles.historicoDetalhe}>
                    {item.horario_aplicado || item.horario_previsto || '--:--'} • {formatarAtraso(item.atraso)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
              </TouchableOpacity>
            );
          })}

          {/* Observações Médicas */}
          {hormonio.observacoes && (
            <>
              <Text style={styles.sectionTitle}>Observações Médicas</Text>
              <View style={styles.observacoesCard}>
                <View style={styles.observacoesIcon}>
                  <Ionicons name="information-circle" size={24} color={colors.primary} />
                </View>
                <View style={styles.observacoesContent}>
                  <Text style={styles.observacoesTexto}>
                    "{hormonio.observacoes}"
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>

    <DetalhesAplicacaoModal
      visible={modalVisible}
      onClose={() => setModalVisible(false)}
      aplicacao={aplicacaoSelecionada}
    />
  </>
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
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE8ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: '#4CAF50',
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    marginBottom: 4,
  },
  dosagem: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  nextCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  nextCardContent: {
    marginBottom: 16,
  },
  nextDate: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
    marginBottom: 4,
  },
  nextCountdown: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.primary,
    marginBottom: 8,
  },
  nextReminder: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  registrarButton: {
    paddingVertical: 12,
  },
  statsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  statsPercentage: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  historicoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verTudo: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primary,
  },
  registrarButtonContainer: {
    marginBottom: 16,
  },
  historicoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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
  historicoData: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
    marginBottom: 2,
  },
  historicoDetalhe: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  observacoesCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 12,
  },
  observacoesIcon: {
    marginTop: 2,
  },
  observacoesContent: {
    flex: 1,
  },
  observacoesTexto: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 20,
  },
  observacoesMedico: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
});
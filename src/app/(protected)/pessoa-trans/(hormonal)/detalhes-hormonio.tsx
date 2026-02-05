// se der tempo vou refatorar esse depois

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import DetalhesAplicacaoModal from '@/components/DetalhesAplicacaoModal';
import { HORMONIOS_MOCK, APLICACOES_MOCK } from '@/mocks/mockPlanoHormonal';


// Mock de histórico
const HISTORICO_MOCK = [
  {
    id: '1',
    data: '2026-01-29',
    horarioPrevisto: '08:00',
    horarioAplicado: '08:00',
    status: 'aplicado',
    atraso: 0,
  },
  {
    id: '2',
    data: '2026-01-22',
    horarioPrevisto: '08:00',
    horarioAplicado: '09:45',
    status: 'atrasado',
    atraso: 105, // minutos
  },
  {
    id: '3',
    data: '2026-01-15',
    horarioPrevisto: '08:00',
    horarioAplicado: '08:00',
    status: 'aplicado',
    atraso: 0,
  },
  {
    id: '4',
    data: '2026-01-08',
    horarioPrevisto: '08:00',
    horarioAplicado: '08:15',
    status: 'atrasado',
    atraso: 15,
  },
];

// Mock de estatísticas
const ESTATISTICAS_MOCK = {
  taxaAdesao: 94,
  noHorario: 12,
  atrasadas: 1,
  atrasoMedio: 15, // minutos
};

export default function DetalhesHormonioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const hormonioId = params.id as string || '1';

  const hormonio = HORMONIOS_MOCK.find(h => h.id === hormonioId) || HORMONIOS_MOCK[0];

  const proximaAplicacao = {
    data: '2026-02-05',
    diasRestantes: 3,
  };

  const historico = HISTORICO_MOCK;

  const stats = ESTATISTICAS_MOCK;

  const handleEditar = () => {
    router.push({
      pathname: '/pessoa-trans/editar-medicamento',
      params: {
        id: hormonio.id,
        nome: hormonio.nome,
        dosagem: hormonio.dosagem,
        unidadeDosagem: 'mg',
        frequencia: hormonio.frequencia,
        modoAplicacao: hormonio.modoAplicacao,
        horarioPreferencial: hormonio.horarioPreferencial,
        observacoesMedicas: hormonio.observacoesMedicas,
      }
    });
  };

  const handleRegistrarAplicacao = () => {
    router.push({
        pathname: '/pessoa-trans/registrar-aplicacao',
        params: {
        hormonio: hormonio.nome,
        data: proximaAplicacao.data,  
        horario: hormonio.horarioPreferencial, 
        modoAplicacao: hormonio.modoAplicacao,
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
  const [aplicacaoSelecionada, setAplicacaoSelecionada] = useState<typeof HISTORICO_MOCK[0] | null>(null);

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
            <Text style={styles.dosagem}>{hormonio.dosagem}{hormonio.unidadeDosagem}/{hormonio.frequencia.toLowerCase()}</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="fitness-outline" size={16} color={colors.muted} />
                <Text style={styles.infoText}>{hormonio.modoAplicacao}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={16} color={colors.muted} />
                <Text style={styles.infoText}>{hormonio.horarioPreferencial}</Text>
              </View>
            </View>
          </View>

          {/* Próxima Aplicação */}
          <Text style={styles.sectionTitle}>Próxima Aplicação</Text>
          <View style={styles.nextCard}>
            <View style={styles.nextCardContent}>
              <Text style={styles.nextDate}>
                {formatarDataCompleta(proximaAplicacao.data)}
              </Text>
              <Text style={styles.nextCountdown}>
                Em {proximaAplicacao.diasRestantes} dias
              </Text>
              <Text style={styles.nextReminder}>
                Prepare sua dose para as {hormonio.horarioPreferencial}
              </Text>
            </View>
            <Button
              title="Registrar"
              onPress={handleRegistrarAplicacao}
              style={styles.registrarButton}
            />
          </View>

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
                  <Text style={styles.historicoData}>{formatarData(item.data)}</Text>
                  <Text style={styles.historicoDetalhe}>
                    {item.horarioAplicado} • {formatarAtraso(item.atraso)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
              </TouchableOpacity>
            );
          })}

          {/* Observações Médicas */}
          <Text style={styles.sectionTitle}>Observações Médicas</Text>
          <View style={styles.observacoesCard}>
            <View style={styles.observacoesIcon}>
              <Ionicons name="information-circle" size={24} color={colors.primary} />
            </View>
            <View style={styles.observacoesContent}>
              <Text style={styles.observacoesTexto}>
                "{hormonio.observacoesMedicas}"
              </Text>
              <Text style={styles.observacoesMedico}>— {hormonio.medico}</Text>
            </View>
          </View>
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
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import StatsCard from '@/components/stats/StatsCard';
import AderenciaCard from '@/components/stats/AderenciaCard';
import SimpleLineChart from '@/components/stats/SimpleLineChart';
import InsightCard from '@/components/stats/InsightCard';
import PadraoItem from '@/components/stats/PadraoItem';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { HORMONIOS_MOCK, ESTATISTICAS_DETALHADAS } from '@/mocks/mockPlanoHormonal';
import SelectModal from '@/components/SelectModal';

type TabType = 'geral' | 'hormonio' | 'tendencias';

export default function EstatisticasScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('geral');
  const [selectedHormonio, setSelectedHormonio] = useState('1');
  const [showHormonioModal, setShowHormonioModal] = useState(false);

  const stats = ESTATISTICAS_DETALHADAS;
  const hormonio = HORMONIOS_MOCK.find(h => h.id === selectedHormonio);
  const hormonioStats = stats.porHormonio[selectedHormonio as '1' | '2'];

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'geral' && styles.tabActive]}
        onPress={() => setActiveTab('geral')}
      >
        <Text style={[styles.tabText, activeTab === 'geral' && styles.tabTextActive]}>
          Geral
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'hormonio' && styles.tabActive]}
        onPress={() => setActiveTab('hormonio')}
      >
        <Text style={[styles.tabText, activeTab === 'hormonio' && styles.tabTextActive]}>
          Por Hormônio
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'tendencias' && styles.tabActive]}
        onPress={() => setActiveTab('tendencias')}
      >
        <Text style={[styles.tabText, activeTab === 'tendencias' && styles.tabTextActive]}>
          Tendências
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderGeralTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AderenciaCard
        taxaAdesao={stats.geral.taxaAdesao}
        noHorario={stats.geral.noHorario}
        atrasadas={stats.geral.atrasadas}
        atrasoMedio={stats.geral.atrasoMedio}
      />

      <StatsCard title="Aplicações dos últimos 30 dias">
        <SimpleLineChart
          data={[2, 2, 2, 2, 2, 1, 2, 2, 2]}
          labels={['1 Ago', '', '15 Ago', '', '30 Ago']}
        />
      </StatsCard>

      <InsightCard insights={['Você é mais consistente pela manhã. Continue assim!']} />
    </ScrollView>
  );

  const renderHormonioTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
    {/* Dropdown */}
    <Text style={styles.label}>Hormônio selecionado</Text>
    <TouchableOpacity 
    style={styles.dropdown}
    onPress={() => setShowHormonioModal(true)}
    >
    <Text style={styles.dropdownText}>{hormonio?.nome}</Text>
    <Ionicons name="chevron-down" size={20} color={colors.muted} />
    </TouchableOpacity>

      {/* Card principal */}
      <View style={styles.card}>
        <View style={styles.hormonioHeader}>
          <Ionicons name="medical" size={24} color={colors.primary} />
          <Text style={styles.hormonioTitle}>{hormonio?.nome}</Text>
        </View>
        <Text style={styles.subtitle}>Últimos 30 dias</Text>

        <Text style={styles.sectionTitle}>Adesão geral</Text>
        <Text style={styles.bigNumber}>{hormonioStats.taxaAdesao}%</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${hormonioStats.taxaAdesao}%` }]} />
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>No horário</Text>
            <Text style={styles.metricValue}>{hormonioStats.aplicacoesNoHorario}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Atrasado</Text>
            <Text style={[styles.metricValue, { color: '#FF9800' }]}>
              {hormonioStats.aplicacoesAtrasadas}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Perdido</Text>
            <Text style={[styles.metricValue, { color: '#F44336' }]}>
              {hormonioStats.aplicacoesPerdidas}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Média de atraso</Text>
            <Text style={styles.metricValue}>{hormonioStats.atrasoMedio} minutos</Text>
          </View>
        </View>
      </View>

      {/* Humor */}
      <StatsCard title="Correlação com humor">
        <Text style={styles.humorValue}>
          Humor médio pós-aplicação: {hormonioStats.humorMedio}/5
        </Text>
      </StatsCard>

      {/* Efeitos colaterais */}
      {hormonioStats.efeitosColaterais.length > 0 && (
        <View style={styles.card}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={20} color="#FF9800" />
            <Text style={styles.cardTitle}>Efeitos Colaterais</Text>
          </View>
          {hormonioStats.efeitosColaterais.map((efeito, index) => (
            <View key={index} style={styles.efeitoRow}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.muted} />
              <Text style={styles.efeitoNome}>{efeito.nome}</Text>
              <Text style={styles.efeitoOcorrencias}>{efeito.ocorrencias}x</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderTendenciasTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Gráfico de adesão ao longo do tempo */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Adesão ao longo do tempo</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Estável (+2%)</Text>
          </View>
        </View>

        <SimpleLineChart
          data={stats.tendencias.adesaoMensal.map(m => m.taxa)}
          labels={stats.tendencias.adesaoMensal.map(m => m.mes)}
        />
      </View>

      {/* Padrões identificados */}
      <StatsCard title="Padrões identificados">
        <PadraoItem
          icon="sunny"
          iconColor="#4CAF50"
          title={`Melhor adesão: ${stats.tendencias.padroes.melhorPeriodo}`}
          subtitle={`${stats.tendencias.padroes.melhorPeriodoTaxa}% de consistência`}
        />
        <PadraoItem
          icon="moon"
          iconColor="#FF9800"
          title={`Mais atrasos: ${stats.tendencias.padroes.piorPeriodo}`}
          subtitle={`${100 - stats.tendencias.padroes.piorPeriodoTaxa}% de atrasos`}
        />
        <PadraoItem
          icon="calendar"
          iconColor="#4CAF50"
          title={`Melhor dia: ${stats.tendencias.padroes.melhorDia}`}
          subtitle={`${stats.tendencias.padroes.melhorDiaTaxa}% de adesão`}
        />
      </StatsCard>

      {/* Insights */}
      <InsightCard insights={stats.tendencias.insights} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header title="Estatísticas" showBackButton />
      
      {renderTabs()}

      <View style={styles.content}>
        {activeTab === 'geral' && renderGeralTab()}
        {activeTab === 'hormonio' && renderHormonioTab()}
        {activeTab === 'tendencias' && renderTendenciasTab()}
      </View>
      <SelectModal
            visible={showHormonioModal}
            title="Selecionar Hormônio"
            options={HORMONIOS_MOCK.filter(h => h.ativo).map(h => h.nome)}
            selectedValue={hormonio?.nome || ''}
            onSelect={(nome) => {
                const h = HORMONIOS_MOCK.find(h => h.nome === nome);
                if (h) setSelectedHormonio(h.id);
                setShowHormonioModal(false);
            }}
            onClose={() => setShowHormonioModal(false)}
            />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.background,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.primary,
    fontFamily: fonts.semibold,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  cardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  hormonioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  hormonioTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.muted,
    marginBottom: 8,
  },
  bigNumber: {
    fontFamily: fonts.bold,
    fontSize: 48,
    color: colors.primary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  metricsGrid: {
    marginTop: 16,
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  metricValue: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  humorValue: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  efeitoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  efeitoNome: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  efeitoOcorrencias: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: '#4CAF50',
  },
});
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useRouter, useFocusEffect } from 'expo-router';
import Button from '@/components/Button';
import { obterUsuarioAtual } from '@/services/auth';
import { buscarPlanosAtivos, buscarProximasAplicacoes, buscarHistoricoAplicacoes } from '@/services/planoHormonal';
import { buscarEntradasPorData } from '@/services/diario';
import type { PlanoHormonal, ProximaAplicacao } from '@/types/planoHormonal';
import type { EntradaDiario, NivelHumor } from '@/types/diario';
import { dataLocalFormatada } from '@/utils/dataLocal';

const FREQUENCIA_PARA_DIAS: Record<string, number> = {
  'Diária': 1,
  'Semanal': 7,
  'Quinzenal': 15,
  'Mensal': 30,
};

const HUMOR_LABELS: Record<NivelHumor, string> = {
  feliz: 'Feliz',
  neutro: 'Neutro',
  triste: 'Triste',
  ansioso: 'Ansioso',
  irritado: 'Irritado',
};

export default function InicioScreen() {
  const [nome, setNome] = useState('');
  const [planos, setPlanos] = useState<PlanoHormonal[]>([]);
  const [proximaAplicacao, setProximaAplicacao] = useState<ProximaAplicacao | null>(null);
  const [aplicacoesHoje, setAplicacoesHoje] = useState(0);
  const [taxaAdesao, setTaxaAdesao] = useState(0);
  const [entradaHoje, setEntradaHoje] = useState<EntradaDiario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  const carregarDados = useCallback(async () => {
    const usuario = await obterUsuarioAtual();
    if (!usuario) {
      setCarregando(false);
      return;
    }

    setNome(usuario.nome?.split(' ')[0] || 'Usuário');

    const hoje = dataLocalFormatada();

    const [planosRes, proximasRes, aplicacoesRes, diarioRes] = await Promise.all([
      buscarPlanosAtivos(usuario.id),
      buscarProximasAplicacoes(usuario.id),
      buscarHistoricoAplicacoes(usuario.id),
      buscarEntradasPorData(usuario.id, hoje),
    ]);

    if (planosRes.sucesso && planosRes.dados) {
      setPlanos(planosRes.dados);
    }

    if (proximasRes.sucesso && proximasRes.dados && proximasRes.dados.length > 0) {
      setProximaAplicacao(proximasRes.dados[0]);
    } else {
      setProximaAplicacao(null);
    }

    // Calcular aplicações de hoje e taxa de adesão
    if (aplicacoesRes.sucesso && aplicacoesRes.dados) {
      const aplicacoesDeHoje = aplicacoesRes.dados.filter(
        a => a.data_aplicacao?.startsWith(hoje)
      );
      setAplicacoesHoje(aplicacoesDeHoje.length);

      // Taxa de adesão: aplicações realizadas vs esperadas (últimos 30 dias)
      const totalAplicacoes = aplicacoesRes.dados.length;
      if (totalAplicacoes > 0 && planosRes.sucesso && planosRes.dados) {
        const planosAtivos = planosRes.dados;
        const diasPassados = 30;
        let aplicacoesEsperadas = 0;
        for (const plano of planosAtivos) {
          const freqDias = plano.frequencia_dias ?? FREQUENCIA_PARA_DIAS[plano.frequencia] ?? 1;
          if (freqDias > 0) {
            aplicacoesEsperadas += Math.floor(diasPassados / freqDias);
          }
        }
        const taxa = aplicacoesEsperadas > 0
          ? Math.min(100, Math.round((totalAplicacoes / aplicacoesEsperadas) * 100))
          : 100;
        setTaxaAdesao(taxa);
      }
    }

    if (diarioRes.sucesso && diarioRes.dados && diarioRes.dados.length > 0) {
      setEntradaHoje(diarioRes.dados[0]);
    } else {
      setEntradaHoje(null);
    }

    setCarregando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  const getHumorTexto = () => {
    if (!entradaHoje?.humor) return 'Não registrado';
    return HUMOR_LABELS[entradaHoje.humor] || 'Não registrado';
  };

  if (carregando) {
    return (
      <View style={[styles.container, styles.carregandoContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Início</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/pessoa-trans/(tabs-pessoatrans)/perfil')}
        >
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

        {/* Saudação */}
        <Text style={styles.greeting}>
          Olá, <Text style={styles.name}>{nome}</Text>
        </Text>

        {/* Plano Hormonal - Card expandido com dados reais */}
        <Text style={styles.sectionTitle}>Plano Hormonal</Text>
        <TouchableOpacity
          style={styles.planoCardExpanded}
          onPress={() => router.push('/pessoa-trans/plano-hormonal')}
        >
          <View style={styles.planoHeader}>
            <View style={styles.planoHeaderLeft}>
              <Ionicons name="medical" size={24} color={colors.primary} />
              <Text style={styles.planoTitle}>Meu Plano Hormonal</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </View>

          <View style={styles.planoStats}>
            <View style={styles.planoStatItem}>
              <Text style={styles.planoStatValue}>
                {planos.length}
              </Text>
              <Text style={styles.planoStatLabel}>Hormônios ativos</Text>
            </View>
            <View style={styles.planoDivider} />
            <View style={styles.planoStatItem}>
              <Text style={styles.planoStatValue}>{aplicacoesHoje}</Text>
              <Text style={styles.planoStatLabel}>Aplicações hoje</Text>
            </View>
            <View style={styles.planoDivider} />
            <View style={styles.planoStatItem}>
              <Text style={styles.planoStatValue}>{taxaAdesao}%</Text>
              <Text style={styles.planoStatLabel}>Taxa de adesão</Text>
            </View>
          </View>

          {proximaAplicacao ? (
            <View style={styles.planoFooter}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={styles.planoFooterText}>
                Próxima aplicação: {proximaAplicacao.atrasada
                  ? 'Atrasada!'
                  : proximaAplicacao.dias_restantes === 0
                    ? 'Hoje'
                    : `Em ${proximaAplicacao.dias_restantes} dia${proximaAplicacao.dias_restantes > 1 ? 's' : ''}`}
                {proximaAplicacao.plano.horario_preferencial
                  ? ` às ${proximaAplicacao.plano.horario_preferencial.substring(0, 5)}`
                  : ''}
              </Text>
            </View>
          ) : (
            <View style={styles.planoFooter}>
              <Ionicons name="time-outline" size={14} color={colors.muted} />
              <Text style={styles.planoFooterText}>Nenhuma aplicação agendada</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Bem-estar com dados reais */}
        <Text style={styles.sectionTitle}>Bem-estar</Text>
        <View style={styles.card}>
          <Ionicons name="happy-outline" size={22} color={colors.primary} />
          <View>
            <Text style={styles.cardTitle}>Hoje</Text>
            <Text style={styles.cardSubtitle}>
              Humor: {getHumorTexto()}
            </Text>
          </View>
        </View>

        {/* Agendar psi e contatos medicos */}
        <Text style={styles.sectionTitle}>Ações</Text>

        <Button
          title="Agendar Psicólogo"
          onPress={() => router.push('/pessoa-trans/agendamento/agendar-psicologo')}
        />

        <View style={{ marginTop: 5 }} />

        <Button
          title="Contatos Médicos"
          onPress={() => router.push('/pessoa-trans/contatos-medicos')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  carregandoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  settingsButton: {
    position: 'absolute',
    right: 16,
  },
  greeting: {
    fontFamily: fonts.bold,
    fontSize: 30,
    color: colors.text,
    marginTop: 10,
    marginBottom: 1,
  },
  name: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    marginTop: 20,
    marginBottom: 8,
    color: colors.text,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  link: {
    fontFamily: fonts.medium,
    color: colors.primary,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fffafb',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardRow: {
    gap: 10,
  },
  cardTitle: {
    fontFamily: fonts.medium,
    color: colors.text,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    color: colors.primary,
    fontSize: 13,
  },
  reminderButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  reminderText: {
    fontFamily: fonts.semibold,
    color: colors.white,
    fontSize: 13,
  },
  viewLink: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  planoCardExpanded: {
    backgroundColor: '#fffafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  planoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  planoHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planoTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
  planoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 12,
  },
  planoStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  planoStatValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.primary,
    marginBottom: 4,
  },
  planoStatLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
  },
  planoDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
  },
  planoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planoFooterText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.primary,
  },
});

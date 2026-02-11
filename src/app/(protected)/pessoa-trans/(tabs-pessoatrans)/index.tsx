import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Button from '@/components/Button';
import ConsultaCard from '@/components/ConsultaCard';
import { supabase } from '@/utils/supabase';
import { obterUsuarioAtual } from '@/services/auth';
import {
  buscarHistoricoAplicacoes,
  buscarPlanosAtivos,
  buscarProximasAplicacoes,
} from '@/services/planoHormonal';
import type { AplicacaoHormonal } from '@/types/planoHormonal';

type ProximaConsultaCard = {
  data: string;
  horario: string;
  psicologoNome: string;
};

const formatarDataCurta = (dataRaw: string) => {
  const dataConsulta = new Date(dataRaw.includes('T') ? dataRaw : `${dataRaw}T00:00:00`);
  return dataConsulta.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  });
};

const extrairHorario = (dataRaw: string, horaRaw?: string | null) => {
  if (horaRaw) return horaRaw.slice(0, 5);
  if (dataRaw.includes('T')) return dataRaw.split('T')[1]?.slice(0, 5) || '--:--';
  return '--:--';
};

const extrairNomeRegistro = (registro: any): string | null => {
  if (!registro) return null;
  return registro.nome || registro.nome_social || registro.nome_civil || null;
};

export default function InicioScreen() {
  const [nome, setNome] = useState<string>('Usuário');
  const [hormoniosAtivos, setHormoniosAtivos] = useState(0);
  const [aplicacoesHoje, setAplicacoesHoje] = useState<AplicacaoHormonal[]>([]);
  const [taxaAdesao, setTaxaAdesao] = useState(0);
  const [proximaAplicacaoTexto, setProximaAplicacaoTexto] = useState('Sem próxima aplicação');
  const [humorMedio, setHumorMedio] = useState<number | null>(null);
  const [proximaConsulta, setProximaConsulta] = useState<ProximaConsultaCard | null>(null);
  const router = useRouter();

  const obterNomeUsuario = async (user: any) => {
    const fallback =
      user?.user_metadata?.nome_social ||
      user?.user_metadata?.nome ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      (user?.email ? String(user.email).split('@')[0] : null) ||
      'Usuário';

    try {
      const usuarioAtual = await obterUsuarioAtual();
      const nomeUsuarioAtual = extrairNomeRegistro(usuarioAtual);
      if (nomeUsuarioAtual) return nomeUsuarioAtual;

      const { data: perfil } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      return extrairNomeRegistro(perfil) || fallback;
    } catch {
      return fallback;
    }
  };

  const buscarProximaConsultaUsuario = async (usuarioId: string): Promise<ProximaConsultaCard | null> => {
    const hojeData = new Date().toISOString().split('T')[0];

    const mapearPsicologoNome = async (psicologoId?: string | null) => {
      if (!psicologoId) return 'Psicólogo(a)';
      const { data: psicologo } = await supabase
        .from('psicologos')
        .select('usuario_id')
        .eq('id', psicologoId)
        .maybeSingle();

      if (!psicologo?.usuario_id) return 'Psicólogo(a)';

      const { data: perfilPsi } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', psicologo.usuario_id)
        .maybeSingle();

      return extrairNomeRegistro(perfilPsi) || 'Psicólogo(a)';
    };

    try {
      const { data: sessao } = await supabase
        .from('sessoes_psicologicas')
        .select('psicologo_id, data_sessao, status')
        .eq('paciente_id', usuarioId)
        .in('status', ['agendada', 'confirmada'])
        .gte('data_sessao', hojeData)
        .order('data_sessao', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (sessao) {
        const psicologoNome = await mapearPsicologoNome(sessao.psicologo_id);
        return {
          data: formatarDataCurta(sessao.data_sessao),
          horario: extrairHorario(sessao.data_sessao),
          psicologoNome,
        };
      }
    } catch {
      // segue para fallback
    }

    try {
      const { data: consulta } = await supabase
        .from('consultas')
        .select('data, hora, psicologo_nome, psicologo_id, status')
        .eq('paciente_id', usuarioId)
        .in('status', ['agendada', 'confirmada'])
        .gte('data', hojeData)
        .order('data', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (consulta) {
        const nomeDireto = (consulta as any).psicologo_nome as string | null;
        const psicologoNome = nomeDireto || await mapearPsicologoNome((consulta as any).psicologo_id);
        return {
          data: formatarDataCurta((consulta as any).data),
          horario: extrairHorario((consulta as any).data, (consulta as any).hora),
          psicologoNome,
        };
      }
    } catch {
      // sem consulta
    }

    return null;
  };

  useFocusEffect(
    useCallback(() => {
      const carregarDados = async () => {
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError || !user) {
            setNome('Usuário');
            setHormoniosAtivos(0);
            setAplicacoesHoje([]);
            setTaxaAdesao(0);
            setProximaAplicacaoTexto('Sem próxima aplicação');
            setHumorMedio(null);
            setProximaConsulta(null);
            return;
          }

          const [nomeRes, planosRes, historicoRes, proximasRes, consultaRes] = await Promise.allSettled([
            obterNomeUsuario(user),
            buscarPlanosAtivos(user.id),
            buscarHistoricoAplicacoes(user.id),
            buscarProximasAplicacoes(user.id),
            buscarProximaConsultaUsuario(user.id),
          ]);

          setNome(nomeRes.status === 'fulfilled' ? nomeRes.value : 'Usuário');

          const planosValor = planosRes.status === 'fulfilled' ? planosRes.value : null;
          setHormoniosAtivos(planosValor?.sucesso && planosValor.dados ? planosValor.dados.length : 0);

          const historicoValor = historicoRes.status === 'fulfilled' ? historicoRes.value : null;
          const apps = historicoValor?.sucesso && historicoValor.dados ? historicoValor.dados : [];
          const hojeStr = new Date().toISOString().split('T')[0];
          const appsHoje = apps.filter(app => app.data_aplicacao.split('T')[0] === hojeStr);
          setAplicacoesHoje(appsHoje);

          const aplicadas = apps.filter(a => a.status === 'aplicado' || a.status === 'atrasado');
          const noHorario = apps.filter(a => a.status === 'aplicado' && a.atraso === 0).length;
          const adesao = aplicadas.length > 0 ? Math.round((noHorario / aplicadas.length) * 100) : 0;
          setTaxaAdesao(adesao);

          const humorHoje = appsHoje.filter(a => typeof a.humor === 'number');
          if (humorHoje.length > 0) {
            const soma = humorHoje.reduce((total, app) => total + (app.humor || 0), 0);
            setHumorMedio(Math.round(soma / humorHoje.length));
          } else {
            setHumorMedio(null);
          }

          const proximasValor = proximasRes.status === 'fulfilled' ? proximasRes.value : null;
          if (proximasValor?.sucesso && proximasValor.dados && proximasValor.dados.length > 0) {
            const proxima = proximasValor.dados[0];
            const horarioApp = proxima.plano.horario_preferencial?.split(':').slice(0, 2).join(':') || '--:--';
            const diasTxt =
              proxima.dias_restantes < 0
                ? 'Atrasada'
                : proxima.dias_restantes === 0
                  ? 'Hoje'
                  : `Em ${proxima.dias_restantes} dias`;
            setProximaAplicacaoTexto(`${diasTxt} às ${horarioApp}`);
          } else {
            setProximaAplicacaoTexto('Sem próxima aplicação');
          }

          setProximaConsulta(consultaRes.status === 'fulfilled' ? consultaRes.value : null);
        } catch (erro) {
          console.error('Erro ao carregar dados da home:', erro);
          setNome('Usuário');
          setHormoniosAtivos(0);
          setAplicacoesHoje([]);
          setTaxaAdesao(0);
          setProximaAplicacaoTexto('Sem próxima aplicação');
          setHumorMedio(null);
          setProximaConsulta(null);
        }
      };

      carregarDados();
    }, [])
  );

  const getHumorTexto = (valor: number | null) => {
    if (!valor) return 'Não registrado';
    const textos = ['Ruim', 'Regular', 'Neutro', 'Bom', 'Ótimo'];
    return textos[valor - 1] || 'Não registrado';
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Início</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/pessoa-trans/configuracoes')}
        >
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

        <Text style={styles.greeting}>
          Olá, <Text style={styles.name}>{nome}</Text>
        </Text>

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
              <Text style={styles.planoStatValue}>{hormoniosAtivos}</Text>
              <Text style={styles.planoStatLabel}>Hormônios ativos</Text>
            </View>
            <View style={styles.planoDivider} />
            <View style={styles.planoStatItem}>
              <Text style={styles.planoStatValue}>{aplicacoesHoje.length}</Text>
              <Text style={styles.planoStatLabel}>Aplicações hoje</Text>
            </View>
            <View style={styles.planoDivider} />
            <View style={styles.planoStatItem}>
              <Text style={styles.planoStatValue}>{taxaAdesao}%</Text>
              <Text style={styles.planoStatLabel}>Taxa de adesão</Text>
            </View>
          </View>

          <View style={styles.planoFooter}>
            <Ionicons name="time-outline" size={14} color={colors.primary} />
            <Text style={styles.planoFooterText}>Próxima aplicação: {proximaAplicacaoTexto}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Minhas Consultas</Text>
        <ConsultaCard
          proximaConsulta={proximaConsulta ? {
            data: proximaConsulta.data,
            horario: proximaConsulta.horario,
            psicologo: proximaConsulta.psicologoNome,
          } : null}
          onPress={() => router.push('/pessoa-trans/consultas')}
        />

        <Text style={styles.sectionTitle}>Bem-estar</Text>
        <View style={styles.card}>
          <Ionicons name="happy-outline" size={22} color={colors.primary} />
          <View>
            <Text style={styles.cardTitle}>Hoje</Text>
            <Text style={styles.cardSubtitle}>Humor: {getHumorTexto(humorMedio)}</Text>
          </View>
        </View>

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

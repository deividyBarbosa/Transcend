import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { CONSULTAS_MOCK } from '@/mocks/mockConsultas';
import { supabase } from '@/utils/supabase';

type ConsultaDetalhe = {
  id: string;
  psicologoNome: string;
  data: string;
  horario: string;
  tipo: 'online' | 'presencial';
  status: 'agendada' | 'realizada' | 'cancelada';
  statusLabel?: string;
  link?: string;
  observacoes?: string;
};

const normalizarStatus = (status: string | null | undefined): ConsultaDetalhe['status'] => {
  const valor = (status || '').toLowerCase();
  if (valor === 'realizada') return 'realizada';
  if (valor === 'cancelada') return 'cancelada';
  return 'agendada';
};

const statusLabel = (status: string | null | undefined) => {
  const valor = (status || '').toLowerCase();
  if (valor === 'agendada') return 'Aguardando confirmacao do psicologo';
  if (valor === 'confirmada') return 'Confirmada';
  if (valor === 'remarcada') return 'Remarcada';
  if (valor === 'realizada') return 'Realizada';
  if (valor === 'cancelada') return 'Cancelada';
  return undefined;
};

export default function ConsultaDetalhesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const consultaId = params.id as string;
  const [consulta, setConsulta] = useState<ConsultaDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [cancelando, setCancelando] = useState(false);

  const carregarConsulta = useCallback(async () => {
    setCarregando(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;

      if (userId) {
        const { data: sessao } = await supabase
          .from('sessoes_psicologicas')
          .select('id, paciente_id, psicologo_id, data_sessao, status, modalidade, link_videochamada, notas_paciente')
          .eq('id', consultaId)
          .eq('paciente_id', userId)
          .maybeSingle();

        if (sessao) {
          let psicologoNome = 'Psicologo(a)';
          const { data: psicologo } = await supabase
            .from('psicologos')
            .select('usuario_id')
            .eq('id', (sessao as any).psicologo_id)
            .maybeSingle();

          if (psicologo?.usuario_id) {
            const { data: perfil } = await supabase
              .from('perfis')
              .select('*')
              .eq('id', psicologo.usuario_id)
              .maybeSingle();

            if (perfil) {
              psicologoNome = perfil.nome_social || perfil.nome || perfil.nome_civil || 'Psicologo(a)';
            }
          }

          const dataSessao = new Date((sessao as any).data_sessao);
          const data = `${dataSessao.getFullYear()}-${String(dataSessao.getMonth() + 1).padStart(2, '0')}-${String(
            dataSessao.getDate()
          ).padStart(2, '0')}`;
          const horario = `${String(dataSessao.getHours()).padStart(2, '0')}:${String(dataSessao.getMinutes()).padStart(2, '0')}`;
          const statusRaw = (sessao as any).status as string | null;

          setConsulta({
            id: (sessao as any).id,
            psicologoNome,
            data,
            horario,
            tipo: (sessao as any).modalidade === 'presencial' ? 'presencial' : 'online',
            status: normalizarStatus(statusRaw),
            statusLabel: statusLabel(statusRaw),
            link: (sessao as any).link_videochamada || undefined,
            observacoes: (sessao as any).notas_paciente || undefined,
          });
          setCarregando(false);
          return;
        }
      }

      const fallback = CONSULTAS_MOCK.find(c => c.id === consultaId) || null;
      if (fallback) {
        setConsulta({
          id: fallback.id,
          psicologoNome: fallback.psicologoNome,
          data: fallback.data,
          horario: fallback.horario,
          tipo: fallback.tipo,
          status: fallback.status,
          statusLabel: fallback.statusLabel,
          link: fallback.link,
          observacoes: fallback.observacoes,
        });
      } else {
        setConsulta(null);
      }
    } catch {
      setConsulta(null);
    } finally {
      setCarregando(false);
    }
  }, [consultaId]);

  useEffect(() => {
    carregarConsulta();
  }, [carregarConsulta]);

  const isAgendada = useMemo(() => consulta?.status === 'agendada', [consulta?.status]);
  const isRealizada = useMemo(() => consulta?.status === 'realizada', [consulta?.status]);

  const formatarDataCompleta = (dataStr: string) => {
    const [ano, mes, dia] = dataStr.split('-');
    const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleEntrarConsulta = () => {
    if (consulta?.link) {
      Linking.openURL(consulta.link).catch(() => {
        Alert.alert('Erro', 'Nao foi possivel abrir o link da consulta');
      });
    }
  };

  const handleCancelarConsulta = () => {
    if (!consulta) return;
    Alert.alert('Cancelar Consulta', 'Tem certeza que deseja cancelar esta consulta?', [
      { text: 'Nao', style: 'cancel' },
      {
        text: 'Sim, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            setCancelando(true);
            const { data: auth } = await supabase.auth.getUser();
            const userId = auth.user?.id;
            if (!userId) {
              Alert.alert('Erro', 'Usuario nao autenticado.');
              setCancelando(false);
              return;
            }

            const { error } = await supabase
              .from('sessoes_psicologicas')
              .update({
                status: 'cancelada',
                cancelado_por: userId,
                motivo_cancelamento: 'Cancelada pela pessoa trans',
              })
              .eq('id', consulta.id)
              .eq('paciente_id', userId)
              .in('status', ['agendada', 'confirmada', 'remarcada']);

            setCancelando(false);
            if (error) {
              Alert.alert('Erro', error.message);
              return;
            }

            Alert.alert('Cancelada', 'Consulta cancelada com sucesso', [{ text: 'OK', onPress: () => router.back() }]);
          } catch {
            setCancelando(false);
            Alert.alert('Erro', 'Nao foi possivel cancelar a consulta.');
          }
        },
      },
    ]);
  };

  const handleReagendar = () => {
    router.push('/pessoa-trans/agendamento/agendar-psicologo');
  };

  if (carregando) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Consulta" showBackButton />
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!consulta) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Consulta" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Consulta nao encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header title="Detalhes da Consulta" showBackButton />

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isAgendada ? '#FFF4E5' : isRealizada ? '#E3F2FD' : '#FFEBEE' },
            ]}
          >
            <Ionicons
              name={isAgendada ? 'calendar-outline' : isRealizada ? 'checkmark-circle-outline' : 'close-circle-outline'}
              size={18}
              color={isAgendada ? '#B26A00' : isRealizada ? '#2196F3' : '#F44336'}
            />
            <Text
              style={[
                styles.statusText,
                { color: isAgendada ? '#B26A00' : isRealizada ? '#2196F3' : '#F44336' },
              ]}
            >
              {consulta.statusLabel || (isAgendada ? 'Agendada' : isRealizada ? 'Realizada' : 'Cancelada')}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.psicologoHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={28} color={colors.primary} />
            </View>
            <View style={styles.psicologoInfo}>
              <Text style={styles.psicologoNome}>{consulta.psicologoNome}</Text>
              <Text style={styles.psicologoLabel}>Psicologo(a)</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informacoes</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Data</Text>
              <Text style={styles.infoValue}>{formatarDataCompleta(consulta.data)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Horario</Text>
              <Text style={styles.infoValue}>{consulta.horario}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons
              name={consulta.tipo === 'online' ? 'videocam-outline' : 'location-outline'}
              size={20}
              color={colors.primary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tipo</Text>
              <Text style={styles.infoValue}>{consulta.tipo === 'online' ? 'Consulta Online' : 'Consulta Presencial'}</Text>
            </View>
          </View>
        </View>

        {isRealizada && consulta.observacoes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Observacoes</Text>
            <View style={styles.observacoesBox}>
              <Text style={styles.observacoesText}>{consulta.observacoes}</Text>
            </View>
          </View>
        )}

        {isAgendada && consulta.link && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Link da Consulta</Text>
            <TouchableOpacity style={styles.linkBox} onPress={handleEntrarConsulta}>
              <Ionicons name="link-outline" size={20} color={colors.primary} />
              <Text style={styles.linkText} numberOfLines={1}>
                {consulta.link}
              </Text>
              <Ionicons name="open-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {isAgendada && (
          <View style={styles.actionsContainer}>
            {consulta.link && <Button title="Entrar na Consulta" onPress={handleEntrarConsulta} style={styles.actionButton} />}

            <Button
              title={cancelando ? 'Cancelando...' : 'Cancelar Consulta'}
              onPress={handleCancelarConsulta}
              variant="outline"
              style={styles.actionButton}
              disabled={cancelando}
            />
          </View>
        )}

        {isRealizada && <Button title="Agendar Nova Consulta" onPress={handleReagendar} style={styles.actionButton} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  psicologoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE8ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  psicologoInfo: {
    flex: 1,
  },
  psicologoNome: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  psicologoLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  observacoesBox: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  observacoesText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  linkText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.primary,
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
  },
});

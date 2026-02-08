import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { CONSULTAS_MOCK, formatarData } from '@/mocks/mockConsultas';

export default function ConsultaDetalhesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const consultaId = params.id as string;

  const consulta = CONSULTAS_MOCK.find(c => c.id === consultaId);

  if (!consulta) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Consulta" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Consulta não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isAgendada = consulta.status === 'agendada';
  const isRealizada = consulta.status === 'realizada';

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
    if (consulta.link) {
      Linking.openURL(consulta.link).catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir o link da consulta');
      });
    }
  };

  const handleCancelarConsulta = () => {
    Alert.alert(
      'Cancelar Consulta',
      'Tem certeza que deseja cancelar esta consulta?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: () => {
            // TODO: Integrar com backend
            Alert.alert('Cancelada', 'Consulta cancelada com sucesso', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  const handleReagendar = () => {
    router.push('/pessoa-trans/agendamento/agendar-psicologo');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header title="Detalhes da Consulta" showBackButton />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isAgendada ? '#E8F5E9' : isRealizada ? '#E3F2FD' : '#FFEBEE',
              },
            ]}
          >
            <Ionicons
              name={
                isAgendada
                  ? 'calendar-outline'
                  : isRealizada
                  ? 'checkmark-circle-outline'
                  : 'close-circle-outline'
              }
              size={18}
              color={isAgendada ? '#4CAF50' : isRealizada ? '#2196F3' : '#F44336'}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: isAgendada ? '#4CAF50' : isRealizada ? '#2196F3' : '#F44336',
                },
              ]}
            >
              {isAgendada ? 'Agendada' : isRealizada ? 'Realizada' : 'Cancelada'}
            </Text>
          </View>
        </View>

        {/* Card do Psicólogo */}
        <View style={styles.card}>
          <View style={styles.psicologoHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={28} color={colors.primary} />
            </View>
            <View style={styles.psicologoInfo}>
              <Text style={styles.psicologoNome}>{consulta.psicologoNome}</Text>
              <Text style={styles.psicologoLabel}>Psicólogo(a)</Text>
            </View>
          </View>
        </View>

        {/* Informações da Consulta */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações</Text>

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
              <Text style={styles.infoLabel}>Horário</Text>
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
              <Text style={styles.infoValue}>
                {consulta.tipo === 'online' ? 'Consulta Online' : 'Consulta Presencial'}
              </Text>
            </View>
          </View>
        </View>

        {/* Observações do Psicólogo (se realizada) */}
        {isRealizada && consulta.observacoes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Observações do Psicólogo</Text>
            <View style={styles.observacoesBox}>
              <Text style={styles.observacoesText}>{consulta.observacoes}</Text>
            </View>
          </View>
        )}

        {/* Link da Consulta (se agendada e tem link) */}
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

        {/* Botões de Ação */}
        {isAgendada && (
          <View style={styles.actionsContainer}>
            {consulta.link && (
              <Button
                title="Entrar na Consulta"
                onPress={handleEntrarConsulta}
                style={styles.actionButton}
              />
            )}

            <Button
              title="Cancelar Consulta"
              onPress={handleCancelarConsulta}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        )}

        {isRealizada && (
          <Button
            title="Agendar Nova Consulta"
            onPress={handleReagendar}
            style={styles.actionButton}
          />
        )}
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
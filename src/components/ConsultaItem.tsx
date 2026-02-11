import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import type { Consulta } from '@/mocks/mockConsultas';
import { formatarData } from '@/mocks/mockConsultas';

interface ConsultaItemProps {
  consulta: Consulta;
  onPress: () => void;
  onEntrarConsulta?: () => void;
}

export default function ConsultaItem({ consulta, onPress, onEntrarConsulta }: ConsultaItemProps) {
  const isAgendada = consulta.status === 'agendada';
  const badgeLabel =
    consulta.statusLabel ||
    (consulta.status === 'agendada'
      ? 'Agendada'
      : consulta.status === 'realizada'
        ? 'Realizada'
        : 'Cancelada');
  const badgeStyle =
    consulta.status === 'agendada'
      ? styles.badgeWarning
      : consulta.status === 'realizada'
        ? styles.badgeSuccess
        : styles.badgeDanger;
  const badgeTextStyle =
    consulta.status === 'agendada'
      ? styles.badgeWarningText
      : consulta.status === 'realizada'
        ? styles.badgeSuccessText
        : styles.badgeDangerText;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isAgendada ? 'calendar-outline' : 'checkmark-circle-outline'}
            size={24}
            color={isAgendada ? colors.primary : '#4CAF50'}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.nome}>{consulta.psicologoNome}</Text>
          <View style={styles.dateTime}>
            <Ionicons name="calendar-outline" size={14} color={colors.muted} />
            <Text style={styles.data}>{formatarData(consulta.data)}</Text>
            <Ionicons name="time-outline" size={14} color={colors.muted} />
            <Text style={styles.data}>{consulta.horario}</Text>
          </View>
          <View style={styles.tipo}>
            <Ionicons
              name={consulta.tipo === 'online' ? 'videocam-outline' : 'location-outline'}
              size={14}
              color={colors.muted}
            />
            <Text style={styles.tipoText}>
              {consulta.tipo === 'online' ? 'Online' : 'Presencial'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      </View>

      <View style={[styles.statusBadge, badgeStyle]}>
        <Text style={[styles.statusBadgeText, badgeTextStyle]}>{badgeLabel}</Text>
      </View>

      {isAgendada && consulta.link && onEntrarConsulta && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.entrarButton} onPress={onEntrarConsulta}>
            <Ionicons name="videocam" size={16} color={colors.white} />
            <Text style={styles.entrarButtonText}>Entrar na consulta</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isAgendada && consulta.observacoes && (
        <View style={styles.observacoes}>
          <Text style={styles.observacoesLabel}>Observações:</Text>
          <Text style={styles.observacoesText} numberOfLines={2}>
            {consulta.observacoes}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE8ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  nome: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 6,
  },
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  data: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  tipo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tipoText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  actions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
  badgeWarning: {
    backgroundColor: '#FFF4E5',
  },
  badgeWarningText: {
    color: '#B26A00',
  },
  badgeSuccess: {
    backgroundColor: '#E8F5E9',
  },
  badgeSuccessText: {
    color: '#2E7D32',
  },
  badgeDanger: {
    backgroundColor: '#FDECEC',
  },
  badgeDangerText: {
    color: '#B71C1C',
  },
  entrarButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  entrarButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.white,
  },
  observacoes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  observacoesLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  observacoesText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
});

// to-do: ajeitar esse components em pastas

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

interface ConsultaCardProps {
  proximaConsulta?: {
    data: string;
    horario: string;
    psicologo: string;
  } | null;
  onPress: () => void;
}

export default function ConsultaCard({ proximaConsulta, onPress }: ConsultaCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="calendar" size={24} color={colors.primary} />
        </View>
        <View style={styles.info}>
          {proximaConsulta ? (
            <>
              <Text style={styles.title}>Próxima consulta</Text>
              <Text style={styles.subtitle}>
                {proximaConsulta.data} às {proximaConsulta.horario}
              </Text>
              <Text style={styles.psicologo}>com {proximaConsulta.psicologo}</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Minhas Consultas</Text>
              <Text style={styles.subtitle}>Nenhuma consulta agendada</Text>
            </>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  title: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.primary,
  },
  psicologo: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
});
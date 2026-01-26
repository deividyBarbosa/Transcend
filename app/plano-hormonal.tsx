/* back-enders heeeeeelp todos os dados aqui são fakes fixos obviamente */
// to-do: editar o plano atual, gráfico de evolução, registrar aplicações

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

export default function PlanoHormonalScreen() {
  const router = useRouter();

  const planoAtual = [
    { id: '1', nome: 'Testosterona', dose: '20mg/semana' },
    { id: '2', nome: 'Finasterida', dose: '1mg/dia' },
  ];

  const historicoDoses = [
    { id: '1', data: '15 de Julho', dose: '20mg' },
    { id: '2', data: '8 de Julho', dose: '20mg' },
    { id: '3', data: '1 de Julho', dose: '20mg' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Meu Plano Hormonal</Text>

        <View style={{ width: 22 }} />
      </View>

      {/* Plano Atual */}
      <Text style={styles.sectionTitle}>Plano Atual</Text>

      {planoAtual.map(item => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardIcon}>
            <Ionicons name="medical-outline" size={18} color={colors.text} />
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text style={styles.cardSubtitle}>{item.dose}</Text>
          </View>

          <TouchableOpacity onPress={() => router.push('/editar-hormonio')}>
            <Ionicons name="create-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ))}

      {/* Histórico */}
      <Text style={styles.sectionTitle}>Histórico de Doses</Text>

      <FlatList
        data={historicoDoses}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons name="calendar-outline" size={18} color={colors.text} />
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.data}</Text>
              <Text style={styles.cardSubtitle}>{item.dose}</Text>
            </View>
          </View>
        )}
      />

      {/* Evolução */}
      <Text style={styles.sectionTitle}>Evolução</Text>

      <View style={styles.evolutionCard}>
        <Text style={styles.level}>550 ng/dL</Text>
        <Text style={styles.evolutionText}>Últimos 6 meses +15%</Text>

        <TouchableOpacity style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Registrar aplicação</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 60,
    marginBottom: 30,
  },
  headerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.text,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.iconBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  evolutionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  level: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text,
  },
  evolutionText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  registerButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: '#fff',
  },
});

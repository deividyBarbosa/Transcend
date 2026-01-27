// to-do: todos os dados aqui são fakes :(

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';
import Button from '../../src/components/Button';
import { Alert } from 'react-native';


export default function InicioScreen() {
  const nome = 'Alex';
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Início</Text>

          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Saudação */}
        <Text style={styles.greeting}>
          Olá, <Text style={styles.name}>{nome}</Text> 
        </Text>

        {/* Plano Hormonal */}
        <Text style={styles.sectionTitle}>Plano Hormonal</Text>

        <TouchableOpacity
          onPress={() => router.push('/plano-hormonal')}
          style={styles.viewButton}
        >
          <Text style={styles.viewLink}>Visualizar</Text>
          <Ionicons
            name="eye-outline"
            size={15}
            color={colors.primary}
            style={{ marginTop: 1 }}
          />
        </TouchableOpacity>

        <View style={styles.card}>
          <Ionicons name="medkit-outline" size={22} color={colors.primary} />
          <View>
            <Text style={styles.cardTitle}>Testosterona</Text>
            <Text style={styles.cardSubtitle}>20mg/semana</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Ionicons name="bandage-outline" size={22} color={colors.primary} />
          <View>
            <Text style={styles.cardTitle}>Finasterida</Text>
            <Text style={styles.cardSubtitle}>1mg/dia</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            <View>
              <Text style={styles.cardTitle}>Ciclo de Aplicação</Text>
              <Text style={styles.cardSubtitle}>Próxima dose em 3 dias</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.reminderButton}>
            <Text style={styles.reminderText}>Ativar Lembrete</Text>
          </TouchableOpacity>
        </View>

        {/* Bem-estar */}
        <Text style={styles.sectionTitle}>Bem-estar</Text>

        <View style={styles.card}>
          <Ionicons name="happy-outline" size={22} color={colors.primary} />
          <View>
            <Text style={styles.cardTitle}>Hoje</Text>
            <Text style={styles.cardSubtitle}>Humor: Feliz</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Ionicons name="heart-outline" size={22} color={colors.primary} />
          <View>
            <Text style={styles.cardTitle}>Sintomas</Text>
            <Text style={styles.cardSubtitle}>Nenhum</Text>
          </View>
        </View>

        {/* Agendar psi e contatos medicos */}
        <Text style={styles.sectionTitle}>Ações</Text>

        <Button 
          title="Agendar Psicólogo" 
          onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')} 
        />

        <View style={{ marginTop: 5 }} />

        <Button 
          title="Contatos Médicos" 
          onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')} 
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
    backgroundColor: '#EADDE0',
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
  gap:4,
},
});

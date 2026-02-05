import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

// Mock de dados dos médicos
const MEDICOS_MOCK = {
  endocrinologistas: [
    {
      id: '1',
      nome: 'Dr. João Pedro',
      atendimento: 'Atendimento online/presencial',
      endereco: 'Rua das Flores, 123, São Paulo',
      planos: 'Unimed, Bradesco, Amil',
      telefone: '(79) 3268-4545',
      foto: 'https://i.pravatar.cc/150?img=12',
    },
    {
      id: '2',
      nome: 'Dra. Ygona Moura',
      atendimento: 'Atendimento online',
      endereco: 'SulAmérica, Golden Cross',
      planos: '',
      telefone: '(79) 3215-8888',
      foto: 'https://i.pravatar.cc/150?img=47',
    },
  ],
  psiquiatras: [
    {
      id: '3',
      nome: 'Dr. Arthur Benozzati',
      atendimento: 'Atendimento presencial',
      endereco: 'Av. Paulista, 456, São Paulo',
      planos: 'Unimed, Bradesco',
      telefone: '(79) 9922-8821',
      foto: 'https://i.pravatar.cc/150?img=33',
    },
    {
      id: '4',
      nome: 'Dra. Aghata Nunes',
      atendimento: 'Atendimento presencial',
      endereco: 'Av. Flores, 488, São Paulo',
      planos: 'Unimed, Bradesco',
      telefone: '(79) 9922-8821',
      foto: 'https://i.pravatar.cc/150?img=44',
    },
  ],
};

interface Medico {
  id: string;
  nome: string;
  atendimento: string;
  endereco: string;
  planos: string;
  telefone: string;
  foto: string;
}

export default function ContatosMedicosScreen() {
  const router = useRouter();
  const [filtroAberto, setFiltroAberto] = useState(false);

  const handleLigar = (telefone: string, nome: string) => {
    Alert.alert(
      'Ligar para ' + nome,
      `Deseja ligar para ${telefone}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Ligar', 
          onPress: () => Linking.openURL(`tel:${telefone.replace(/\D/g, '')}`)
        },
      ]
    );
  };

  const renderMedicoCard = (medico: Medico) => (
    <View key={medico.id} style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.infoContainer}>
          <Text style={styles.nomeMedico}>{medico.nome}</Text>
          <Text style={styles.atendimento}>{medico.atendimento}</Text>
          
          {medico.endereco && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color={colors.primary} />
              <Text style={styles.infoText}>{medico.endereco}</Text>
            </View>
          )}
          
          {medico.planos && (
            <View style={styles.infoRow}>
              <Ionicons name="medkit-outline" size={14} color={colors.primary} />
              <Text style={styles.infoText}>Planos: {medico.planos}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.telefoneButton}
            onPress={() => handleLigar(medico.telefone, medico.nome)}
          >
            <Text style={styles.telefoneText}>{medico.telefone}</Text>
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri: medico.foto }}
          style={styles.fotoMedico}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Header 
        title="Médicos" 
        showBackButton 
        rightIcon={
            <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => Alert.alert('Filtros', 'Funcionalidade em desenvolvimento')}
            >
            <Ionicons name="filter" size={20} color={colors.text} />
            <Text style={styles.filterText}>Filtrar</Text>
            </TouchableOpacity>
        }
        />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Endocrinologistas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Endocrinologistas na sua região</Text>
            {MEDICOS_MOCK.endocrinologistas.map(renderMedicoCard)}
          </View>

          {/* Psiquiatras */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Psiquiatras na sua região</Text>
            {MEDICOS_MOCK.psiquiatras.map(renderMedicoCard)}
          </View>
        </ScrollView>
      </View>
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
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
  },
  nomeMedico: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  atendimento: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.primary,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    flex: 1,
  },
  telefoneButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  telefoneText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.white,
  },
  fotoMedico: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
});
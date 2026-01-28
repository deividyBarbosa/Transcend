/* back-enders heeeeeelp todos os dados aqui são fakes fixos obviamente */
// to-do: gráfico de evolução, registrar aplicações

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import MedicationCard from '@/components/MedicationCard';
import DismissKeyboard from '@/components/DismissKeyboard';

export default function PlanoHormonalScreen() {
  const router = useRouter();

  const [planoAtual, setPlanoAtual] = useState([
    { id: '1', nome: 'Testosterona', dose: '20mg/semana' },
    { id: '2', nome: 'Finasterida', dose: '1mg/dia' },
  ]);

  const historicoDoses = [
    { id: '1', data: '15 de Julho', dose: '20mg' },
    { id: '2', data: '8 de Julho', dose: '20mg' },
    { id: '3', data: '1 de Julho', dose: '20mg' },
  ];

  const parseDose = (dose: string) => {
    const match = dose.match(/^(\d+\.?\d*)([a-zçõãá()]+)\/(.+)$/i); // isso funciona!!
    if (match) {
      return {
        quantidade: match[1],
        unidade: match[2],
        frequencia: match[3],
      };
    }
    return { quantidade: '', unidade: '', frequencia: '' };
  };
    return (
    <DismissKeyboard>
      <View style={styles.container}>

        <Header 
          title="Meu Plano Hormonal" 
          showBackButton 
        />

      <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
      >

        {/* Plano Atual */}

          <Text style={styles.sectionTitle}>Plano Atual</Text>

          {planoAtual.map(item => {
            const parsed = parseDose(item.dose);  // ← Faltou isso
            return (
              <MedicationCard
                key={item.id}
                icon="medical-outline"
                title={item.nome}
                subtitle={item.dose}
                onEdit={() => router.push({  // ← onEdit, não pathname direto
                  pathname: '/editar-medicamento',
                  params: {
                    id: item.id,
                    nome: item.nome,
                    ...parsed
                  }
                })}
              />
            );
          })}

          <MedicationCard
            variant="add"
            title="Adicionar medicamento"
            onPress={() => router.push('/editar-medicamento')}
          />

          {/* Histórico */}

            <Text style={styles.sectionTitle}>Histórico de Doses</Text>

            {historicoDoses.map(item => (
              <MedicationCard
                key={item.id}
                icon="calendar-outline"
                title={item.data}
                subtitle={item.dose}
              />
            ))}

          {/* Evolução */}
          <Text style={styles.sectionTitle}>Evolução</Text>

          <View style={styles.evolutionCard}>
            <Text style={styles.level}>550 ng/dL</Text>
            <Text style={styles.evolutionText}>Últimos 6 meses +15%</Text>
            
            {/* gráfico  que nao funciona :) */}
            <View style={styles.graphPlaceholder}>
              <Text style={styles.graphText}>📊 Gráfico em desenvolvimento</Text>
            </View>
            
            <Button 
              title="Registrar aplicação"
              onPress={() => Alert.alert('Registrar', 'Funcionalidade em desenvolvimento')}
            />
          </View>
        </ScrollView>
      </View>
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
    marginTop: 20,
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
 graphPlaceholder: {
  backgroundColor: colors.white,
  borderRadius: 12,
  padding: 30,
  alignItems: 'center',
  marginVertical: 20,
  },
  graphText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import ProfileOption from '@/components/ProfileOption';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

export default function ConfiguracoesScreen() {
  const router = useRouter();

  // Estados das configurações
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [lembreteAplicacao, setLembreteAplicacao] = useState(true);
  const [lembreteConsulta, setLembreteConsulta] = useState(true);
  const [lembreteDiario, setLembreteDiario] = useState(false);

  const handleAntecedenciaLembrete = () => {
    Alert.alert(
      'Antecedência do Lembrete',
      'Escolha com quanto tempo de antecedência deseja ser lembrado',
      [
        { text: '15 minutos', onPress: () => console.log('15min') },
        { text: '30 minutos', onPress: () => console.log('30min') },
        { text: '1 hora', onPress: () => console.log('1h') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleExportarDados = () => {
    Alert.alert(
      'Exportar Dados',
      'Seus dados serão exportados em formato PDF',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Exportar',
          onPress: () => Alert.alert('Sucesso', 'Funcionalidade em desenvolvimento'),
        },
      ]
    );
  };

  const handleApagarHistorico = () => {
    Alert.alert(
      'Apagar Histórico',
      'Tem certeza? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => Alert.alert('Histórico apagado', 'Funcionalidade em desenvolvimento'),
        },
      ]
    );
  };

//   const handleBiometria = () => {
//     Alert.alert('Biometria', 'Funcionalidade em desenvolvimento');
//   };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header title="Configurações" showBackButton />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Notificações */}
        <Text style={styles.sectionTitle}>Notificações</Text>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
              <Text style={styles.switchLabel}>Notificações</Text>
            </View>
            <Switch
              value={notificacoesAtivas}
              onValueChange={setNotificacoesAtivas}
              trackColor={{ false: '#E0E0E0', true: colors.primary + '80' }}
              thumbColor={notificacoesAtivas ? colors.primary : '#f4f3f4'}
            />
          </View>

          {notificacoesAtivas && (
            <>
              <View style={styles.divider} />

              <View style={styles.switchRow}>
                <View style={styles.switchLeft}>
                  <Ionicons name="medical-outline" size={20} color={colors.text} />
                  <Text style={styles.switchLabel}>Lembrete de aplicação</Text>
                </View>
                <Switch
                  value={lembreteAplicacao}
                  onValueChange={setLembreteAplicacao}
                  trackColor={{ false: '#E0E0E0', true: colors.primary + '80' }}
                  thumbColor={lembreteAplicacao ? colors.primary : '#f4f3f4'}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.switchRow}>
                <View style={styles.switchLeft}>
                  <Ionicons name="calendar-outline" size={20} color={colors.text} />
                  <Text style={styles.switchLabel}>Lembrete de consulta</Text>
                </View>
                <Switch
                  value={lembreteConsulta}
                  onValueChange={setLembreteConsulta}
                  trackColor={{ false: '#E0E0E0', true: colors.primary + '80' }}
                  thumbColor={lembreteConsulta ? colors.primary : '#f4f3f4'}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.switchRow}>
                <View style={styles.switchLeft}>
                  <Ionicons name="book-outline" size={20} color={colors.text} />
                  <Text style={styles.switchLabel}>Lembrete de diário</Text>
                </View>
                <Switch
                  value={lembreteDiario}
                  onValueChange={setLembreteDiario}
                  trackColor={{ false: '#E0E0E0', true: colors.primary + '80' }}
                  thumbColor={lembreteDiario ? colors.primary : '#f4f3f4'}
                />
              </View>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.optionRow}
                onPress={handleAntecedenciaLembrete}
              >
                <View style={styles.switchLeft}>
                  <Ionicons name="time-outline" size={20} color={colors.text} />
                  <Text style={styles.switchLabel}>Antecedência do lembrete</Text>
                </View>
                <View style={styles.optionRight}>
                  <Text style={styles.optionValue}>30 min</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* acho que não vai dar tempo mas vou deixar aqui */
        
        /* Privacidade
        <Text style={styles.sectionTitle}>Privacidade</Text>

        <ProfileOption
          icon="lock-closed-outline"
          title="Bloquear com Biometria"
          subtitle="Use digital ou Face ID para desbloquear"
          onPress={handleBiometria}
        /> */}

        {/* Dados */}
        <Text style={styles.sectionTitle}>Dados</Text>

        <ProfileOption
          icon="trash-outline"
          title="Apagar Histórico"
          subtitle="Remove todo o histórico de aplicações"
          onPress={handleApagarHistorico}
          color="#F44336"
        />

        {/* Sobre */}
        <Text style={styles.sectionTitle}>Sobre</Text>

        <ProfileOption
          icon="information-circle-outline"
          title="Versão do App"
          subtitle="1.0.0"
          onPress={() => {}}
          showChevron={false}
        />
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
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  switchLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
});
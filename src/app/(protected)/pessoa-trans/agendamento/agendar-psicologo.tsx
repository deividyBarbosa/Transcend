import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { supabase } from '@/utils/supabase';
import {
  buscarPsicologoPrincipalDoPaciente,
  listarPsicologosParaAgendamento,
  type PsicologoAgenda,
} from '@/services/agendamento';

export default function AgendarPsicologoScreen() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [psicologos, setPsicologos] = useState<PsicologoAgenda[]>([]);
  const [psicologoPrincipalId, setPsicologoPrincipalId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const carregar = async () => {
        setCarregando(true);
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;

        if (!userId) {
          setPsicologos([]);
          setPsicologoPrincipalId(null);
          setCarregando(false);
          return;
        }

        const [listaRes, principalRes] = await Promise.all([
          listarPsicologosParaAgendamento(),
          buscarPsicologoPrincipalDoPaciente(userId),
        ]);

        setPsicologos(listaRes.sucesso && listaRes.dados ? listaRes.dados : []);
        setPsicologoPrincipalId(principalRes.sucesso ? principalRes.dados || null : null);
        setCarregando(false);
      };

      carregar();
    }, [])
  );

  const handleVerDisponibilidade = (psicologo: PsicologoAgenda) => {
    const params = new URLSearchParams({
      psicologoId: psicologo.id,
      nome: psicologo.nome,
      foto: psicologo.foto,
    }).toString();

    router.push(`/pessoa-trans/agendamento/agendar-consulta?${params}`);
  };

  const renderPsicologoCard = (psicologo: PsicologoAgenda, isPrincipal = false) => (
    <View key={psicologo.id} style={styles.card}>
      {isPrincipal && <Text style={styles.badge}>Seu Psicólogo</Text>}

      <View style={styles.cardContent}>
        <View style={styles.infoContainer}>
          <Text style={styles.tipoAtendimento}>{psicologo.tipo}</Text>
          <Text style={styles.nomePsicologo}>{psicologo.nome}</Text>
          <Text style={styles.especialidade}>{psicologo.especialidade}</Text>

          <TouchableOpacity
            style={styles.disponibilidadeButton}
            onPress={() => handleVerDisponibilidade(psicologo)}
          >
            <Text style={styles.disponibilidadeText}>Ver disponibilidade</Text>
          </TouchableOpacity>
        </View>

        <Image source={{ uri: psicologo.foto }} style={styles.fotoPsicologo} />
      </View>
    </View>
  );

  const psicologoPrincipal = psicologos.find(p => p.id === psicologoPrincipalId) || null;
  const outrosPsicologos = psicologos.filter(p => p.id !== psicologoPrincipalId);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Header title="Agendar Psicólogo" showBackButton />

        {carregando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {psicologos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum psicólogo disponível no momento.</Text>
              </View>
            ) : (
              <>
                {psicologoPrincipal && renderPsicologoCard(psicologoPrincipal, true)}
                {outrosPsicologos.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>
                      {psicologoPrincipal ? 'Outros Psicólogos' : 'Psicólogos'}
                    </Text>
                    {outrosPsicologos.map(psicologo => renderPsicologoCard(psicologo, false))}
                  </>
                )}
              </>
            )}
          </ScrollView>
        )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoContainer: {
    flex: 1,
    marginRight: 16,
  },
  tipoAtendimento: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.primary,
    marginBottom: 8,
  },
  nomePsicologo: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  especialidade: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.primary,
    marginBottom: 12,
    lineHeight: 18,
  },
  disponibilidadeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  disponibilidadeText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.white,
  },
  fotoPsicologo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E0E0E0',
  },
  emptyContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  emptyText: {
    fontFamily: fonts.regular,
    color: colors.muted,
    textAlign: 'center',
  },
});

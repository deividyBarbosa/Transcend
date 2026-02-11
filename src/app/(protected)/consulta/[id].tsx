import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { supabase } from '@/utils/supabase';
import { CONSULTAS_MOCK } from '@/mocks/mockConsultas';

export default function ConsultaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const consultaId = id as string;

  const [consulta, setConsulta] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('consultas')
          .select('*')
          .eq('id', consultaId)
          .maybeSingle();

        if (error || !data) {
          // fallback to mock data if table doesn't exist or no record
          const mock = CONSULTAS_MOCK.find((c: any) => c.id === consultaId) || null;
          if (mounted) setConsulta(mock);
        } else if (mounted) {
          setConsulta(data);
        }
      } catch (e) {
        console.error('Erro ao buscar consulta:', e);
        const mock = CONSULTAS_MOCK.find((c: any) => c.id === consultaId) || null;
        if (mounted) setConsulta(mock);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [consultaId]);

  if (loading) return (
    <View style={styles.container}><ActivityIndicator size="large" color={colors.primary} /></View>
  );

  if (!consulta) return (
    <View style={styles.container}><Text>Consulta não encontrada</Text></View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{consulta.patientName ?? consulta.paciente_nome ?? 'Consulta'}</Text>
      <Text style={styles.subtitle}>{consulta.date ?? consulta.data ?? ''} • {consulta.time ?? consulta.hora ?? ''}</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitle: { marginTop: 8, color: '#6B7280' },
  button: { marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});

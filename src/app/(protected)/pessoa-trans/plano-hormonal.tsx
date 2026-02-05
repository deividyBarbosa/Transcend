import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import Header from '@/components/Header';
import Button from '@/components/Button';
import MedicationCard from '@/components/MedicationCard';
import DismissKeyboard from '@/components/DismissKeyboard';
import ErrorMessage from '@/components/ErrorMessage';
import { supabase } from '@/utils/supabase';
import {
  buscarPlanosAtivos,
  buscarHistoricoAplicacoes,
  registrarAplicacao,
} from '@/services/planoHormonal';
import type { PlanoHormonal } from '@/types/planoHormonal';
import type { AplicacaoHormonal } from '@/types/planoHormonal';

const DIAS_PARA_FREQUENCIA: Record<number, string> = {
  1: 'dia',
  7: 'semana',
  30: 'mês',
  180: 'semestre',
  365: 'ano',
};

const frequenciaLabel = (dias: number): string => {
  return DIAS_PARA_FREQUENCIA[dias] || `${dias} dias`;
};

const parseDosagem = (dosagem: string) => {
  const match = dosagem.match(/^(\d+\.?\d*)(.+)$/);
  if (match) {
    return { quantidade: match[1], unidade: match[2] };
  }
  return { quantidade: dosagem, unidade: '' };
};

export default function PlanoHormonalScreen() {
  const router = useRouter();

  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [planos, setPlanos] = useState<PlanoHormonal[]>([]);
  const [aplicacoes, setAplicacoes] = useState<AplicacaoHormonal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = useCallback(async (uid: string) => {
    setCarregando(true);
    setErro(null);

    const [planosRes, aplicacoesRes] = await Promise.all([
      buscarPlanosAtivos(uid),
      buscarHistoricoAplicacoes(uid, undefined, 10),
    ]);

    if (planosRes.sucesso && planosRes.dados) {
      setPlanos(planosRes.dados);
    } else if (!planosRes.sucesso) {
      setErro(planosRes.erro || 'Não foi possível carregar seus planos hormonais. Verifique sua conexão e tente novamente.');
    }

    if (aplicacoesRes.sucesso && aplicacoesRes.dados) {
      setAplicacoes(aplicacoesRes.dados);
    } else if (!aplicacoesRes.sucesso && !erro) {
      setErro(aplicacoesRes.erro || 'Não foi possível carregar o histórico de aplicações. Verifique sua conexão e tente novamente.');
    }

    setCarregando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const inicializar = async () => {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setUsuarioId(data.user.id);
          await carregarDados(data.user.id);
        } else {
          setCarregando(false);
        }
      };
      inicializar();
    }, [carregarDados])
  );

  const handleRegistrarAplicacao = async () => {
    setErro(null);

    if (!usuarioId) {
      setErro('Você precisa estar autenticado para registrar uma aplicação. Faça login novamente.');
      return;
    }

    if (planos.length === 0) {
      setErro('Adicione um medicamento ao plano antes de registrar uma aplicação.');
      return;
    }

    if (planos.length === 1) {
      await registrarParaPlano(planos[0]);
    } else {
      // Let the user pick which plan to register for
      const botoes = planos.map(plano => ({
        text: `${plano.nome} (${plano.dosagem})`,
        onPress: () => registrarParaPlano(plano),
      }));
      botoes.push({ text: 'Cancelar', onPress: () => {} });

      Alert.alert('Registrar aplicação', 'Qual medicamento?', botoes);
    }
  };

  const registrarParaPlano = async (plano: PlanoHormonal) => {
    if (!usuarioId) return;

    setRegistrando(true);
    setErro(null);

    const hoje = new Date().toISOString().split('T')[0];
    const resultado = await registrarAplicacao({
      plano_id: plano.id,
      usuario_id: usuarioId,
      data_aplicacao: hoje,
      dosagem_aplicada: plano.dosagem,
    });

    setRegistrando(false);

    if (!resultado.sucesso) {
      setErro(resultado.erro || 'Não foi possível registrar a aplicação. Tente novamente.');
      return;
    }

    Alert.alert('Sucesso', 'Aplicação registrada!');
    await carregarDados(usuarioId);
  };

  const formatarData = (dataStr: string): string => {
    const data = new Date(dataStr + 'T00:00:00');
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    return `${data.getDate()} de ${meses[data.getMonth()]}`;
  };

  const navegarParaEditar = (plano: PlanoHormonal) => {
    const { quantidade, unidade } = parseDosagem(plano.dosagem);
    const freq = frequenciaLabel(plano.frequencia_dias);

    router.push({
      pathname: '/pessoa-trans/editar-medicamento',
      params: {
        id: plano.id,
        nome: plano.nome,
        quantidade,
        unidade,
        frequencia: freq,
        tipo_hormonio: plano.tipo_hormonio,
        via_administracao: plano.via_administracao,
      },
    });
  };

  if (carregando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <DismissKeyboard>
      <View style={styles.container}>
        <Header title="Meu Plano Hormonal" showBackButton />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <ErrorMessage message={erro} />

          {/* Plano Atual */}
          <Text style={styles.sectionTitle}>Plano Atual</Text>

          {planos.length === 0 && (
            <Text style={styles.emptyText}>Nenhum medicamento cadastrado</Text>
          )}

          {planos.map(plano => (
            <MedicationCard
              key={plano.id}
              icon="medical-outline"
              title={plano.nome}
              subtitle={`${plano.dosagem}/${frequenciaLabel(plano.frequencia_dias)}`}
              onEdit={() => navegarParaEditar(plano)}
            />
          ))}

          <MedicationCard
            variant="add"
            title="Adicionar medicamento"
            onPress={() => router.push('/pessoa-trans/editar-medicamento')}
          />

          {/* Histórico */}
          <Text style={styles.sectionTitle}>Histórico de Doses</Text>

          {aplicacoes.length === 0 && (
            <Text style={styles.emptyText}>Nenhuma aplicação registrada</Text>
          )}

          {aplicacoes.map(item => (
            <MedicationCard
              key={item.id}
              icon="calendar-outline"
              title={formatarData(item.data_aplicacao)}
              subtitle={item.dosagem_aplicada || ''}
            />
          ))}

          {/* Evolução */}
          <Text style={styles.sectionTitle}>Evolução</Text>

          <View style={styles.evolutionCard}>
            <View style={styles.graphPlaceholder}>
              <Text style={styles.graphText}>Gráfico em desenvolvimento</Text>
            </View>

            <Button
              title={registrando ? 'Registrando...' : 'Registrar aplicação'}
              onPress={handleRegistrarAplicacao}
              disabled={registrando}
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
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    marginBottom: 10,
  },
  evolutionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
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

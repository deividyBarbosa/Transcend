import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { obterUsuarioAtual } from '@/services/auth';
import {
  adicionarDisponibilidadeDoPsicologo,
  listarDisponibilidadeDoPsicologo,
  removerDisponibilidadeDoPsicologo,
  type DisponibilidadePsicologo,
} from '@/services/agendamento';

const DIAS = [
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sab', value: 6 },
  { label: 'Dom', value: 7 },
];

const MODALIDADES = [
  { label: 'Online', value: 'online' },
  { label: 'Presencial', value: 'presencial' },
];

const DIA_LABEL_MAP: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terca',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sabado',
  7: 'Domingo',
};

const horarioValido = (value: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const formatModalidade = (modalidade: string | null) => {
  if (!modalidade) return 'Online';
  const normalizado = modalidade.toLowerCase();
  if (normalizado === 'presencial') return 'Presencial';
  return 'Online';
};

export default function DisponibilidadePsicologoScreen() {
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [lista, setLista] = useState<DisponibilidadePsicologo[]>([]);
  const [diaSemana, setDiaSemana] = useState(1);
  const [modalidade, setModalidade] = useState('online');
  const [inicio, setInicio] = useState('08:00');
  const [fim, setFim] = useState('12:00');

  const carregarDisponibilidade = useCallback(async () => {
    setCarregando(true);
    const usuario = await obterUsuarioAtual();
    if (!usuario?.id) {
      setUsuarioId(null);
      setLista([]);
      setCarregando(false);
      return;
    }

    setUsuarioId(usuario.id);
    const resultado = await listarDisponibilidadeDoPsicologo(usuario.id);
    if (resultado.sucesso) {
      setLista(resultado.dados || []);
    } else {
      Alert.alert('Erro', resultado.erro || 'Nao foi possivel carregar disponibilidade.');
    }
    setCarregando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDisponibilidade();
    }, [carregarDisponibilidade])
  );

  const disponibilidadeOrdenada = useMemo(
    () =>
      [...lista].sort((a, b) => {
        if (a.dia_semana !== b.dia_semana) return a.dia_semana - b.dia_semana;
        return a.horario_inicio.localeCompare(b.horario_inicio);
      }),
    [lista]
  );

  const adicionar = useCallback(async () => {
    if (!usuarioId) {
      Alert.alert('Erro', 'Usuario nao autenticado.');
      return;
    }

    if (!horarioValido(inicio) || !horarioValido(fim)) {
      Alert.alert('Horario invalido', 'Use o formato HH:MM. Exemplo: 09:30');
      return;
    }

    if (toMinutes(inicio) >= toMinutes(fim)) {
      Alert.alert('Horario invalido', 'Horario final deve ser maior que o inicial.');
      return;
    }

    setSalvando(true);
    const resultado = await adicionarDisponibilidadeDoPsicologo(usuarioId, {
      dia_semana: diaSemana,
      horario_inicio: inicio,
      horario_fim: fim,
      modalidade,
    });
    setSalvando(false);

    if (!resultado.sucesso) {
      Alert.alert('Erro', resultado.erro || 'Nao foi possivel salvar disponibilidade.');
      return;
    }

    await carregarDisponibilidade();
    Alert.alert('Sucesso', 'Disponibilidade cadastrada.');
  }, [usuarioId, inicio, fim, diaSemana, modalidade, carregarDisponibilidade]);

  const remover = useCallback(
    (id: string) => {
      if (!usuarioId) return;
      Alert.alert('Remover horario', 'Deseja remover esta disponibilidade?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const resultado = await removerDisponibilidadeDoPsicologo(usuarioId, id);
            if (!resultado.sucesso) {
              Alert.alert('Erro', resultado.erro || 'Nao foi possivel remover disponibilidade.');
              return;
            }
            await carregarDisponibilidade();
          },
        },
      ]);
    },
    [usuarioId, carregarDisponibilidade]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Header title="Disponibilidade" showBackButton />

        {carregando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Cadastrar novo horario</Text>

              <Text style={styles.label}>Dia da semana</Text>
              <View style={styles.chipsRow}>
                {DIAS.map(dia => (
                  <TouchableOpacity
                    key={dia.value}
                    style={[styles.chip, diaSemana === dia.value && styles.chipSelected]}
                    onPress={() => setDiaSemana(dia.value)}
                  >
                    <Text style={[styles.chipText, diaSemana === dia.value && styles.chipTextSelected]}>
                      {dia.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Modalidade</Text>
              <View style={styles.chipsRow}>
                {MODALIDADES.map(item => (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.chip, modalidade === item.value && styles.chipSelected]}
                    onPress={() => setModalidade(item.value)}
                  >
                    <Text style={[styles.chipText, modalidade === item.value && styles.chipTextSelected]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputsRow}>
                <View style={styles.inputWrap}>
                  <Input
                    label="Inicio"
                    value={inicio}
                    onChangeText={setInicio}
                    placeholder="08:00"
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
                <View style={styles.inputWrap}>
                  <Input
                    label="Fim"
                    value={fim}
                    onChangeText={setFim}
                    placeholder="12:00"
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              </View>

              <Button title="Salvar disponibilidade" onPress={adicionar} loading={salvando} />
            </View>

            <View style={styles.listCard}>
              <Text style={styles.sectionTitle}>Horarios cadastrados</Text>
              {disponibilidadeOrdenada.length === 0 ? (
                <Text style={styles.emptyText}>Voce ainda nao cadastrou horarios.</Text>
              ) : (
                disponibilidadeOrdenada.map(item => (
                  <View key={item.id} style={styles.item}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle}>
                        {DIA_LABEL_MAP[item.dia_semana] || `Dia ${item.dia_semana}`}
                      </Text>
                      <Text style={styles.itemSubtitle}>
                        {item.horario_inicio.slice(0, 5)} - {item.horario_fim.slice(0, 5)} |{' '}
                        {formatModalidade(item.modalidade)}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => remover(item.id)}>
                      <Text style={styles.removeText}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  listCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.text,
    fontFamily: fonts.semibold,
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    fontFamily: fonts.medium,
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8C9D0',
    backgroundColor: '#FFF8FA',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  chipTextSelected: {
    color: colors.white,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWrap: {
    flex: 1,
  },
  emptyText: {
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 4,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 10,
  },
  itemTitle: {
    fontFamily: fonts.semibold,
    color: colors.text,
    fontSize: 14,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontFamily: fonts.regular,
    color: colors.muted,
    fontSize: 13,
  },
  removeText: {
    fontFamily: fonts.semibold,
    color: '#F44336',
    fontSize: 13,
  },
});

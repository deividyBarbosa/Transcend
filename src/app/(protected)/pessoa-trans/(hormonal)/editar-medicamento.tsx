import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, FlatList, NativeSyntheticEvent, NativeScrollEvent, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DismissKeyboard from '@/components/DismissKeyboard';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SelectModal from '@/components/SelectModal';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { supabase } from '@/utils/supabase';
import { criarPlano, atualizarPlano, removerHormonio } from '@/services/planoHormonal';

// Wheel picker
const ITEM_HEIGHT = 52;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const HORAS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTOS = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

// Opções para os selects
const MODOS_APLICACAO = [
  'Oral',
  'Injetável',
  'Transdérmico',
  'Sublingual',
  'Gel/Creme',
];

const FREQUENCIAS = [
  'Diária',
  'Semanal',
  'Quinzenal',
  'Mensal',
];

const DIAS_SEMANA = [
  { label: 'Segunda', value: 1 },
  { label: 'Terça', value: 2 },
  { label: 'Quarta', value: 3 },
  { label: 'Quinta', value: 4 },
  { label: 'Sexta', value: 5 },
  { label: 'Sábado', value: 6 },
  { label: 'Domingo', value: 0 },
];

const UNIDADES_DOSAGEM = [
  'mg',
  'mg/ml',
  'mcg',
  'ml',
  'comprimidos',
  'aplicações',
];

export default function EditarMedicamentoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;

  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);


  useEffect(() => {
    const obterUsuario = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setUsuarioId(data.user.id);
    };
    obterUsuario();
  }, []);

  // Estados básicos
  const [nome, setNome] = useState(params.nome as string || '');
  const [dosagem, setDosagem] = useState(params.dosagem as string || '');
  const [unidadeDosagem, setUnidadeDosagem] = useState(params.unidadeDosagem as string || '');
  const [modoAplicacao, setModoAplicacao] = useState(params.modoAplicacao as string || '');
  const [frequencia, setFrequencia] = useState(params.frequencia as string || '');
  
  // Estados novos
  const [horarioPreferencial, setHorarioPreferencial] = useState(params.horarioPreferencial as string || '');
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [localAplicacao, setLocalAplicacao] = useState(params.localAplicacao as string || '');
  const [observacoesMedicas, setObservacoesMedicas] = useState(params.observacoesMedicas as string || '');
  
  // Modais
  const [showModoModal, setShowModoModal] = useState(false);
  const [showFrequenciaModal, setShowFrequenciaModal] = useState(false);
  const [showUnidadeModal, setShowUnidadeModal] = useState(false);
  const [showHorarioModal, setShowHorarioModal] = useState(false);
  const [horaSelecionada, setHoraSelecionada] = useState('08');
  const [minutoSelecionado, setMinutoSelecionado] = useState('00');
  const horaListRef = useRef<FlatList>(null);
  const minutoListRef = useRef<FlatList>(null);

  const abrirHorarioModal = useCallback(() => {
    const partes = horarioPreferencial ? horarioPreferencial.split(':') : [];
    const h = partes[0] || '08';
    const m = partes[1] || '00';
    // Achar o minuto mais próximo nos intervalos de 5
    const minArredondado = (Math.round(parseInt(m) / 5) * 5).toString().padStart(2, '0');
    setHoraSelecionada(h);
    setMinutoSelecionado(minArredondado);
    setShowHorarioModal(true);

    setTimeout(() => {
      const horaIdx = HORAS.indexOf(h);
      const minIdx = MINUTOS.indexOf(minArredondado);
      horaListRef.current?.scrollToOffset({ offset: horaIdx * ITEM_HEIGHT, animated: false });
      minutoListRef.current?.scrollToOffset({ offset: minIdx * ITEM_HEIGHT, animated: false });
    }, 100);
  }, [horarioPreferencial]);

  const onWheelScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>, dados: string[], setter: (val: string) => void) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, dados.length - 1));
    setter(dados[clamped]);
  }, []);

  const formScrollRef = useRef<ScrollView>(null);

  // Validação
  const validarFormulario = () => {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Nome do hormônio é obrigatório');
      return false;
    }
    if (!dosagem.trim()) {
      Alert.alert('Atenção', 'Dosagem é obrigatória');
      return false;
    }
    if (!unidadeDosagem) {
      Alert.alert('Atenção', 'Unidade de dosagem é obrigatória');
      return false;
    }
    if (!modoAplicacao) {
      Alert.alert('Atenção', 'Modo de aplicação é obrigatório');
      return false;
    }
    if (!frequencia) {
      Alert.alert('Atenção', 'Frequência é obrigatória');
      return false;
    }
    if (!horarioPreferencial) {
      Alert.alert('Atenção', 'Horário preferencial é obrigatório');
      return false;
    }
    // Se for injetável e frequência não for diária, precisa selecionar dias
    if ( modoAplicacao === 'Injetável' && (frequencia === 'Semanal' || frequencia === 'Quinzenal') && diasSemana.length === 0 ) {
      Alert.alert('Atenção', 'Selecione os dias da semana para aplicação');
      return false;
    }
    return true;
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) return;

    if (!usuarioId) {
      Alert.alert('Erro', 'Você precisa estar autenticado. Faça login novamente.');
      return;
    }

    setSalvando(true);

    if (isEditing) {
      const resultado = await atualizarPlano(params.id as string, usuarioId, {
        nome,
        dosagem,
        unidade_dosagem: unidadeDosagem,
        modo_aplicacao: modoAplicacao,
        frequencia,
        horario_preferencial: horarioPreferencial || null,
        dias_semana: diasSemana.length > 0 ? diasSemana : null,
        observacoes: observacoesMedicas || null,
      });

      setSalvando(false);

      if (!resultado.sucesso) {
        Alert.alert('Erro', resultado.erro || 'Não foi possível atualizar o hormônio.');
        return;
      }

      Alert.alert('Sucesso', 'Hormônio atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      const resultado = await criarPlano({
        usuario_id: usuarioId,
        nome,
        dosagem,
        unidade_dosagem: unidadeDosagem,
        modo_aplicacao: modoAplicacao,
        frequencia,
        horario_preferencial: horarioPreferencial || null,
        dias_semana: diasSemana.length > 0 ? diasSemana : null,
        data_inicio: new Date().toISOString().split('T')[0],
        observacoes: observacoesMedicas || null,
      });

      setSalvando(false);

      if (!resultado.sucesso) {
        Alert.alert('Erro', resultado.erro || 'Não foi possível salvar o hormônio.');
        return;
      }

      Alert.alert('Sucesso', 'Hormônio adicionado com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const handleRemover = () => {
    if (!usuarioId) {
      Alert.alert('Erro', 'Você precisa estar autenticado. Faça login novamente.');
      return;
    }

    Alert.alert(
      'Confirmar remoção',
      'Deseja realmente remover este hormônio? O histórico será mantido.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setSalvando(true);
            const resultado = await removerHormonio(params.id as string, usuarioId);
            setSalvando(false);

            if (!resultado.sucesso) {
              Alert.alert('Erro', resultado.erro || 'Não foi possível remover o hormônio.');
              return;
            }

            Alert.alert('Removido', 'Hormônio removido com sucesso', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  const toggleDiaSemana = (dia: number) => {
    setDiasSemana(prev => 
      prev.includes(dia) 
        ? prev.filter(d => d !== dia)
        : [...prev, dia].sort()
    );
  };


  const mostrarCampoInjetavel = modoAplicacao === 'Injetável';
  const mostrarDiasSemana = frequencia !== 'Diária' && (frequencia === 'Semanal' || frequencia === 'Quinzenal');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <DismissKeyboard>
        <View style={styles.container}>
          <Header
            title={isEditing ? 'Editar Hormônio' : 'Adicionar Hormônio'}
            showBackButton
          />
          
          <ScrollView
            ref={formScrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Seção: Informações Básicas */}
            <Text style={styles.sectionTitle}>Informações Básicas</Text>

            <Input
              label="Nome do hormônio *"
              placeholder="Ex: Estradiol, Testosterona"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />

            {/* Dosagem e Unidade na mesma linha */}
            <Text style={styles.label}>Dosagem e Unidade *</Text>
            <View style={styles.rowInputs}>
              <View style={{ flex: 2, marginRight: 8 }}>
                <TextInput
                  style={styles.inputLikeSelect}
                  placeholder="Ex: 2"
                  placeholderTextColor={colors.muted}
                  value={dosagem}
                  onChangeText={setDosagem}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => setShowUnidadeModal(true)}>
                  <View pointerEvents="none">
                    <TextInput
                      style={styles.inputLikeSelect}
                      value={unidadeDosagem || ''}
                      placeholder="mg"
                      placeholderTextColor={colors.muted}
                      editable={false}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.label}>Modo de aplicação *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowModoModal(true)}
            >
              <Text style={modoAplicacao ? styles.selectText : styles.selectPlaceholder}>
                {modoAplicacao || 'Selecionar'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Frequência *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowFrequenciaModal(true)}
            >
              <Text style={frequencia ? styles.selectText : styles.selectPlaceholder}>
                {frequencia || 'Selecionar'}
              </Text>
            </TouchableOpacity>

            {/* Dias da semana - só aparece se não for diária */}
            {mostrarDiasSemana && (
              <>
                <Text style={styles.label}>Dias da semana *</Text>
                <View style={styles.diasSemanaContainer}>
                  {DIAS_SEMANA.map((dia) => {
                    const selecionado = diasSemana.includes(dia.value);
                    return (
                      <TouchableOpacity
                        key={dia.value}
                        style={[styles.diaChip, selecionado && styles.diaChipSelecionado]}
                        onPress={() => toggleDiaSemana(dia.value)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.diaChipTexto, selecionado && styles.diaChipTextoSelecionado]}>
                          {dia.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* Seção: Horários */}
            <Text style={styles.sectionTitle}>Horário</Text>

            <Text style={styles.label}>Horário preferencial *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={abrirHorarioModal}
            >
              <Text style={horarioPreferencial ? styles.selectText : styles.selectPlaceholder}>
                {horarioPreferencial ? horarioPreferencial.split(':').slice(0, 2).join(':') : 'Selecionar horário'}
              </Text>
            </TouchableOpacity>

            {/* Seção: Aplicação Injetável */}
            {mostrarCampoInjetavel && (
              <>
                <Text style={styles.sectionTitle}>Aplicação Injetável</Text>
                <Input
                  label="Local de aplicação sugerido"
                  placeholder="Ex: coxa direita, braço esquerdo"
                  value={localAplicacao}
                  onChangeText={setLocalAplicacao}
                  autoCapitalize="sentences"
                />
                <Text style={styles.hint}>
                  💡 Importante fazer rotação de locais de aplicação
                </Text>
              </>
            )}

            {/* Seção: Observações */}
            <Text style={styles.sectionTitle}>Observações</Text>

            <Input
              label="Instruções médicas"
              placeholder="Ex: tomar em jejum, após refeição..."
              value={observacoesMedicas}
              onChangeText={setObservacoesMedicas}
              multiline
              numberOfLines={3}
              style={{ height: 80 }}
              onFocus={() => {
                setTimeout(() => {
                  formScrollRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
            />

            {/* Botões */}
            <View style={styles.buttonContainer}>
              <Button title={salvando ? 'Salvando...' : 'Salvar'} onPress={handleSalvar} disabled={salvando} />
              
              {isEditing && (
                <View style={{ marginTop: 15 }}>
                  <Button
                    title="Remover hormônio"
                    onPress={handleRemover}
                    variant="outline"
                  />
                </View>
              )}
            </View>
          </ScrollView>

          {/* Modais */}
          <SelectModal
            visible={showModoModal}
            title="Modo de Aplicação"
            options={MODOS_APLICACAO}
            selectedValue={modoAplicacao}
            onSelect={setModoAplicacao}
            onClose={() => setShowModoModal(false)}
          />

          <SelectModal
            visible={showFrequenciaModal}
            title="Frequência"
            options={FREQUENCIAS}
            selectedValue={frequencia}
            onSelect={setFrequencia}
            onClose={() => setShowFrequenciaModal(false)}
          />

          <SelectModal
            visible={showUnidadeModal}
            title="Unidade de Dosagem"
            options={UNIDADES_DOSAGEM}
            selectedValue={unidadeDosagem}
            onSelect={setUnidadeDosagem}
            onClose={() => setShowUnidadeModal(false)}
          />

          {/* Modal seletor de horário — wheel picker */}
          <Modal
            visible={showHorarioModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowHorarioModal(false)}
          >
            <View style={styles.modalOverlay}>
              {/* Overlay: fechar ao tocar fora */}
              <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowHorarioModal(false)} />

              <View style={styles.horarioModalContainer}>
                <Text style={styles.horarioModalTitulo}>Selecionar Horário</Text>

                <View style={styles.wheelRow}>
                  {/* Coluna hora */}
                  <View style={styles.wheelColumn}>
                    <Text style={styles.wheelLabel}>Hora</Text>
                    <View style={{ height: WHEEL_HEIGHT, overflow: 'hidden' }}>
                      <View style={[styles.wheelHighlight, { top: ITEM_HEIGHT * 2 }]} pointerEvents="none" />
                      <FlatList
                        ref={horaListRef}
                        data={HORAS}
                        keyExtractor={(item) => item}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                        snapToInterval={ITEM_HEIGHT}
                        decelerationRate="fast"
                        bounces={false}
                        overScrollMode="never"
                        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                        onMomentumScrollEnd={(e) => onWheelScroll(e, HORAS, setHoraSelecionada)}
                        onScrollEndDrag={(e) => {
                          const y = e.nativeEvent.contentOffset.y;
                          const idx = Math.round(y / ITEM_HEIGHT);
                          const clamped = Math.max(0, Math.min(idx, HORAS.length - 1));
                          setHoraSelecionada(HORAS[clamped]);
                        }}
                        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                        renderItem={({ item }) => (
                          <View style={styles.wheelItem}>
                            <Text style={[
                              styles.wheelItemText,
                              item === horaSelecionada && styles.wheelItemTextSelected,
                            ]}>
                              {item}
                            </Text>
                          </View>
                        )}
                      />
                    </View>
                  </View>

                  {/* Separador */}
                  <Text style={styles.wheelSeparator}>:</Text>

                  {/* Coluna minuto */}
                  <View style={styles.wheelColumn}>
                    <Text style={styles.wheelLabel}>Min</Text>
                    <View style={{ height: WHEEL_HEIGHT, overflow: 'hidden' }}>
                      <View style={[styles.wheelHighlight, { top: ITEM_HEIGHT * 2 }]} pointerEvents="none" />
                      <FlatList
                        ref={minutoListRef}
                        data={MINUTOS}
                        keyExtractor={(item) => item}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                        snapToInterval={ITEM_HEIGHT}
                        decelerationRate="fast"
                        bounces={false}
                        overScrollMode="never"
                        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                        onMomentumScrollEnd={(e) => onWheelScroll(e, MINUTOS, setMinutoSelecionado)}
                        onScrollEndDrag={(e) => {
                          const y = e.nativeEvent.contentOffset.y;
                          const idx = Math.round(y / ITEM_HEIGHT);
                          const clamped = Math.max(0, Math.min(idx, MINUTOS.length - 1));
                          setMinutoSelecionado(MINUTOS[clamped]);
                        }}
                        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                        renderItem={({ item }) => (
                          <View style={styles.wheelItem}>
                            <Text style={[
                              styles.wheelItemText,
                              item === minutoSelecionado && styles.wheelItemTextSelected,
                            ]}>
                              {item}
                            </Text>
                          </View>
                        )}
                      />
                    </View>
                  </View>
                </View>

                {/* Botões */}
                <View style={styles.horarioModalBotoes}>
                  <TouchableOpacity
                    style={styles.horarioModalBotaoCancelar}
                    onPress={() => setShowHorarioModal(false)}
                  >
                    <Text style={styles.horarioModalTextoCancelar}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.horarioModalBotaoConfirmar}
                    onPress={() => {
                      setHorarioPreferencial(`${horaSelecionada}:${minutoSelecionado}`);
                      setShowHorarioModal(false);
                    }}
                  >
                    <Text style={styles.horarioModalTextoConfirmar}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

        </View>
        </DismissKeyboard>
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
  scrollContent: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginTop: 2,
    marginBottom: 12,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    marginTop: 0,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 12,  
  },
  inputLikeSelect: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    height: 52,
    marginBottom: 12,  
  },
  selectInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 52,
    justifyContent: 'center',
    marginBottom: 12,  
  },
  selectText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  selectPlaceholder: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginTop: -8, 
    marginBottom: 12,
    fontStyle: 'italic',
  },
  diasSemanaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  diaChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  diaChipSelecionado: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  diaChipTexto: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  diaChipTextoSelecionado: {
    color: colors.white,
  },
  buttonContainer: {
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  horarioModalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  horarioModalTitulo: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  wheelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  wheelColumn: {
    flex: 1,
    alignItems: 'center',
  },
  wheelLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 8,
  },
  wheelHighlight: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: ITEM_HEIGHT,
    backgroundColor: colors.primary + '15',
    borderRadius: 14,
    zIndex: 1,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItemText: {
    fontFamily: fonts.regular,
    fontSize: 24,
    color: colors.muted,
  },
  wheelItemTextSelected: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.primary,
  },
  wheelSeparator: {
    fontFamily: fonts.bold,
    fontSize: 36,
    color: colors.text,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  horarioModalBotoes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  horarioModalBotaoCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  horarioModalTextoCancelar: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.muted,
  },
  horarioModalBotaoConfirmar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  horarioModalTextoConfirmar: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.white,
  },
});
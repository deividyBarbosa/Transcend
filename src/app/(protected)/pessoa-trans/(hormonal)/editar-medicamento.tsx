import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
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
  const [showDiasSemanaModal, setShowDiasSemanaModal] = useState(false);

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
    if (modoAplicacao === 'Injetável' && frequencia !== 'Diária' && diasSemana.length === 0) {
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

  const getDiasSemanaTexto = () => {
    if (diasSemana.length === 0) return 'Selecionar';
    const labels = diasSemana.map(d => DIAS_SEMANA.find(ds => ds.value === d)?.label || '');
    return labels.join(', ');
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
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowDiasSemanaModal(true)}
                >
                  <Text style={diasSemana.length > 0 ? styles.selectText : styles.selectPlaceholder}>
                    {getDiasSemanaTexto()}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Seção: Horários */}
            <Text style={styles.sectionTitle}>Horário</Text>

            <Input
              label="Horário preferencial *"
              placeholder="Ex: 08:00 ou 22:00"
              value={horarioPreferencial}
              onChangeText={setHorarioPreferencial}
              keyboardType="numbers-and-punctuation"
            />

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

          {/* Modal de dias da semana - vai melhorar depois, eu espero */}
          <SelectModal
            visible={showDiasSemanaModal}
            title="Dias da Semana"
            options={DIAS_SEMANA.map(d => d.label)}
            selectedValue=""
            onSelect={(label) => {
              const dia = DIAS_SEMANA.find(d => d.label === label);
              if (dia) {
                toggleDiaSemana(dia.value);
              }
            }}
            onClose={() => setShowDiasSemanaModal(false)}
          />
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
  buttonContainer: {
    marginTop: 24,
  },
});
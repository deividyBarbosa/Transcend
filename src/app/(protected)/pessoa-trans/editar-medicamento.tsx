import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DismissKeyboard from '@/components/DismissKeyboard';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import SelectModal from '@/components/SelectModal';
import { supabase } from '@/utils/supabase';
import { criarPlano, atualizarPlano, removerHormonio } from '@/services/planoHormonal';
import type { TipoHormonio, ViaAdministracao } from '@/database/schema';

const UNIDADES = ['mg', 'mcg', 'mL', 'comprimido(s)', 'cápsula(s)', 'gotas', 'adesivo(s)'];
const FREQUENCIAS = ['dia', 'semana', 'mês', 'semestre', 'ano'];

const TIPOS_HORMONIO: { label: string; value: TipoHormonio }[] = [
  { label: 'Estradiol', value: 'estradiol' },
  { label: 'Testosterona', value: 'testosterona' },
  { label: 'Progesterona', value: 'progesterona' },
  { label: 'Bloqueador', value: 'bloqueador' },
];

const VIAS_ADMINISTRACAO: { label: string; value: ViaAdministracao }[] = [
  { label: 'Injetável', value: 'injetavel' },
  { label: 'Gel', value: 'gel' },
  { label: 'Adesivo', value: 'adesivo' },
  { label: 'Oral', value: 'oral' },
  { label: 'Sublingual', value: 'sublingual' },
];

const FREQUENCIA_PARA_DIAS: Record<string, number> = {
  dia: 1,
  semana: 7,
  'mês': 30,
  semestre: 180,
  ano: 365,
};

export default function EditarHormonioScreen() {
  const [showUnidadeModal, setShowUnidadeModal] = useState(false);
  const [showFrequenciaModal, setShowFrequenciaModal] = useState(false);
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [showViaModal, setShowViaModal] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;

  const [nome, setNome] = useState((params.nome as string) || '');
  const [quantidade, setQuantidade] = useState((params.quantidade as string) || '');
  const [unidade, setUnidade] = useState((params.unidade as string) || '');
  const [frequencia, setFrequencia] = useState((params.frequencia as string) || '');
  const [tipoHormonio, setTipoHormonio] = useState((params.tipo_hormonio as string) || '');
  const [viaAdministracao, setViaAdministracao] = useState((params.via_administracao as string) || '');

  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const buscarUsuario = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUsuarioId(data.user.id);
      }
    };
    buscarUsuario();
  }, []);

  const getTipoLabel = (value: string) =>
    TIPOS_HORMONIO.find(t => t.value === value)?.label || '';

  const getViaLabel = (value: string) =>
    VIAS_ADMINISTRACAO.find(v => v.value === value)?.label || '';

  const handleSalvar = async () => {
    setErro(null);

    if (!nome.trim()) {
      setErro('Digite o nome do medicamento para identificá-lo no seu plano.');
      return;
    }
    if (!quantidade || isNaN(Number(quantidade))) {
      setErro('Informe uma quantidade válida (somente números). Ex: 20');
      return;
    }
    if (!unidade) {
      setErro('Selecione a unidade de medida do medicamento (ex: mg, mL).');
      return;
    }
    if (!frequencia) {
      setErro('Selecione com que frequência você aplica este medicamento.');
      return;
    }
    if (!tipoHormonio) {
      setErro('Selecione o tipo de hormônio utilizado.');
      return;
    }
    if (!viaAdministracao) {
      setErro('Selecione a via de administração do medicamento (ex: injetável, oral).');
      return;
    }
    if (!usuarioId) {
      setErro('Você precisa estar autenticado para salvar. Faça login novamente.');
      return;
    }

    setSalvando(true);

    const dosagem = `${quantidade}${unidade}`;
    const frequenciaDias = FREQUENCIA_PARA_DIAS[frequencia] ?? 1;

    if (isEditing) {
      const resultado = await atualizarPlano(params.id as string, usuarioId, {
        nome: nome.trim(),
        medicamento: nome.trim(),
        dosagem,
        tipo_hormonio: tipoHormonio as TipoHormonio,
        via_administracao: viaAdministracao as ViaAdministracao,
        frequencia_dias: frequenciaDias,
      });

      setSalvando(false);

      if (!resultado.sucesso) {
        setErro(resultado.erro || 'Não foi possível atualizar o medicamento. Tente novamente.');
        return;
      }

      Alert.alert('Sucesso', 'Medicamento atualizado!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      const hoje = new Date().toISOString().split('T')[0];

      const resultado = await criarPlano({
        usuario_id: usuarioId,
        nome: nome.trim(),
        tipo_hormonio: tipoHormonio as TipoHormonio,
        medicamento: nome.trim(),
        dosagem,
        via_administracao: viaAdministracao as ViaAdministracao,
        frequencia_dias: frequenciaDias,
        data_inicio: hoje,
      });

      setSalvando(false);

      if (!resultado.sucesso) {
        setErro(resultado.erro || 'Não foi possível adicionar o medicamento. Tente novamente.');
        return;
      }

      Alert.alert('Sucesso', 'Medicamento adicionado!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const handleRemover = () => {
    setErro(null);

    if (!usuarioId) {
      setErro('Você precisa estar autenticado para remover. Faça login novamente.');
      return;
    }

    Alert.alert(
      'Confirmar',
      'Deseja realmente remover este medicamento? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const resultado = await removerHormonio(params.id as string, usuarioId);

            if (!resultado.sucesso) {
              setErro(resultado.erro || 'Não foi possível remover o medicamento. Tente novamente.');
              return;
            }

            Alert.alert('Sucesso', 'Medicamento removido!', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <DismissKeyboard>
      <View style={styles.container}>
        <Header
          title={isEditing ? 'Editar Medicamento' : 'Adicionar Medicamento'}
          showBackButton
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ErrorMessage message={erro} />

          {/* Nome do medicamento */}
          <Input
            label="Nome do medicamento"
            placeholder="Ex: Testosterona"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />

          {/* Tipo de hormônio */}
          <Text style={styles.label}>Tipo de hormônio</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowTipoModal(true)}
          >
            <Text style={tipoHormonio ? styles.selectText : styles.selectPlaceholder}>
              {tipoHormonio ? getTipoLabel(tipoHormonio) : 'Selecionar'}
            </Text>
          </TouchableOpacity>

          <SelectModal
            visible={showTipoModal}
            title="Selecionar Tipo de Hormônio"
            options={TIPOS_HORMONIO.map(t => t.label)}
            selectedValue={getTipoLabel(tipoHormonio)}
            onSelect={(label) => {
              const tipo = TIPOS_HORMONIO.find(t => t.label === label);
              if (tipo) setTipoHormonio(tipo.value);
            }}
            onClose={() => setShowTipoModal(false)}
          />

          {/* Via de administração */}
          <Text style={styles.label}>Via de administração</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowViaModal(true)}
          >
            <Text style={viaAdministracao ? styles.selectText : styles.selectPlaceholder}>
              {viaAdministracao ? getViaLabel(viaAdministracao) : 'Selecionar'}
            </Text>
          </TouchableOpacity>

          <SelectModal
            visible={showViaModal}
            title="Selecionar Via de Administração"
            options={VIAS_ADMINISTRACAO.map(v => v.label)}
            selectedValue={getViaLabel(viaAdministracao)}
            onSelect={(label) => {
              const via = VIAS_ADMINISTRACAO.find(v => v.label === label);
              if (via) setViaAdministracao(via.value);
            }}
            onClose={() => setShowViaModal(false)}
          />

          {/* Quantidade */}
          <Input
            label="Quantidade"
            placeholder="Ex: 20"
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="decimal-pad"
          />

          {/* Unidade */}
          <Text style={styles.label}>Unidade</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowUnidadeModal(true)}
          >
            <Text style={unidade ? styles.selectText : styles.selectPlaceholder}>
              {unidade || 'Selecionar'}
            </Text>
          </TouchableOpacity>

          <SelectModal
            visible={showUnidadeModal}
            title="Selecionar Unidade"
            options={UNIDADES}
            selectedValue={unidade}
            onSelect={setUnidade}
            onClose={() => setShowUnidadeModal(false)}
          />

          {/* Frequência */}
          <Text style={styles.label}>Frequência</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowFrequenciaModal(true)}
          >
            <Text style={frequencia ? styles.selectText : styles.selectPlaceholder}>
              {frequencia || 'Selecionar'}
            </Text>
          </TouchableOpacity>

          <SelectModal
            visible={showFrequenciaModal}
            title="Selecionar Frequência"
            options={FREQUENCIAS}
            selectedValue={frequencia}
            onSelect={setFrequencia}
            onClose={() => setShowFrequenciaModal(false)}
          />

          {/* Botões */}
          <Button
            title={salvando ? 'Salvando...' : 'Salvar'}
            onPress={handleSalvar}
            disabled={salvando}
          />

          {isEditing && (
            <View style={{ marginTop: 15 }}>
              <Button
                title="Remover medicamento"
                onPress={handleRemover}
                variant="outline"
              />
            </View>
          )}
        </ScrollView>
      </View>
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    marginBottom: 12,
  },
  selectInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  selectText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  selectPlaceholder: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
});

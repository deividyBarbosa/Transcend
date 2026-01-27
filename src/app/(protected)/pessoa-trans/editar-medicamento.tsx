// back-enders preciso de vocês na edição do medicamento

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, router } from 'expo-router';
import DismissKeyboard from '@/components/DismissKeyboard';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import SelectModal from '@/components/SelectModal';

const UNIDADES = ['mg', 'mcg', 'mL', 'comprimido(s)', 'cápsula(s)', 'gotas', 'adesivo(s)'];
const FREQUENCIAS = ['dia', 'semana', 'mês', 'semestre', 'ano'];

export default function EditarHormonioScreen() {
  const [showUnidadeModal, setShowUnidadeModal] = useState(false);
  const [showFrequenciaModal, setShowFrequenciaModal] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;
  const [nome, setNome] = useState((params.nome as string) || '');
  const [quantidade, setQuantidade] = useState((params.quantidade as string) || '');
  const [unidade, setUnidade] = useState((params.unidade as string) || '');
  const [frequencia, setFrequencia] = useState((params.frequencia as string) || '');

  const handleSalvar = () => {
    // Validações
    if (!nome.trim()) {
        Alert.alert('Atenção', 'Digite o nome do medicamento');
        return;
    }
    if (!quantidade || isNaN(Number(quantidade))) {
        Alert.alert('Atenção', 'Digite uma quantidade válida (número)');
        return;
    }
    if (!unidade) {
        Alert.alert('Atenção', 'Selecione a unidade');
        return;
    }
    if (!frequencia) {
         Alert.alert('Atenção', 'Selecione a frequência');
         return;
    }

    // Mock
    const medicamento = {
        nome,
        dose: `${quantidade}${unidade}/${frequencia}`,
    };

    Alert.alert(
        'Sucesso',
        isEditing ? 'Medicamento atualizado!' : 'Medicamento adicionado!',
        [
        {
            text: 'OK',
            onPress: () => router.back(),
        },
        ]
    );
    };

  const handleRemover = () => {
    Alert.alert(
      'Confirmar',
      'Deseja realmente remover este medicamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            // Mock mock mock....
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
          {/* Nome do medicamento */}
          <Input
            label="Nome do medicamento"
            placeholder="Ex: Testosterona"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
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
          <Button title="Salvar" onPress={handleSalvar} />

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
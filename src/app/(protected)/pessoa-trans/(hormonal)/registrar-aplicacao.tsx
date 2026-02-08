import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DismissKeyboard from '@/components/DismissKeyboard';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SelectModal from '@/components/SelectModal';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { supabase } from '@/utils/supabase';
import { registrarAplicacao, buscarPlanosAtivos } from '@/services/planoHormonal';
import type { PlanoHormonal } from '@/types/planoHormonal';

// Opções para os selects
const EFEITOS_COLATERAIS = [
  'Nenhum',
  'Dor de cabeça',
  'Náusea',
  'Tontura',
  'Sonolência',
  'Dor local',
  'Irritabilidade',
  'Outro',
];

const LOCAIS_APLICACAO = [
  'Coxa direita',
  'Coxa esquerda',
  'Braço direito',
  'Braço esquerdo',
  'Glúteo direito',
  'Glúteo esquerdo',
  'Abdômen',
];

export default function RegistrarAplicacaoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const formScrollRef = useRef<ScrollView>(null);
  
  const hormonio = params.hormonio as string || 'Hormônio';
  const data = params.data as string || new Date().toISOString().split('T')[0];
  const horario = params.horario as string || '08:00';
  const modoAplicacao = params.modoAplicacao as string || 'Oral';

  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [planoIdResolvido, setPlanoIdResolvido] = useState(params.planoId as string || '');
  const [planosAtivos, setPlanosAtivos] = useState<PlanoHormonal[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const inicializar = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      setUsuarioId(data.user.id);

      // Se planoId não veio como param, buscar planos ativos
      if (!params.planoId) {
        const resultado = await buscarPlanosAtivos(data.user.id);
        if (resultado.sucesso && resultado.dados) {
          setPlanosAtivos(resultado.dados);
          if (resultado.dados.length === 1) {
            setPlanoIdResolvido(resultado.dados[0].id);
          }
        }
      }
    };
    inicializar();
  }, []);

  // Estados
  const [horarioReal, setHorarioReal] = useState('');
  const [localAplicacao, setLocalAplicacao] = useState('');
  const [efeitosColaterais, setEfeitosColaterais] = useState<string[]>([]);
  const [humor, setHumor] = useState<number | null>(null);
  const [observacoes, setObservacoes] = useState('');
  
  // Modais
  const [showLocalModal, setShowLocalModal] = useState(false);
  const [showEfeitosModal, setShowEfeitosModal] = useState(false);
  
  const mostrarCampoLocal = modoAplicacao === 'Injetável';
  
  const salvarAplicacao = async (planoId: string, uid?: string) => {
    const userId = uid || usuarioId;
    if (!userId) return;

    const agora = new Date();
    const horarioAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
    const horarioAplicado = horarioReal || horarioAtual;

    setSalvando(true);

    const resultado = await registrarAplicacao({
      plano_id: planoId,
      usuario_id: userId,
      data_aplicacao: data,
      horario_previsto: horario,
      horario_aplicado: horarioAplicado,
      status: 'aplicado',
      local_aplicacao: localAplicacao || null,
      efeitos_colaterais: efeitosColaterais.length > 0 ? efeitosColaterais : null,
      humor,
      observacoes: observacoes || null,
    });

    setSalvando(false);

    if (!resultado.sucesso) {
      Alert.alert('Erro', resultado.erro || 'Não foi possível registrar a aplicação.');
      return;
    }

    Alert.alert(
      'Aplicação Registrada!',
      `${hormonio} aplicado às ${horarioAplicado}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleAplicadoAgora = async () => {
    // Buscar usuário se ainda não temos
    let uid = usuarioId;
    if (!uid) {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        Alert.alert('Erro', 'Você precisa estar autenticado. Faça login novamente.');
        return;
      }
      uid = userData.user.id;
      setUsuarioId(uid);
    }

    // Se já temos o planoId resolvido, salvar direto
    if (planoIdResolvido) {
      await salvarAplicacao(planoIdResolvido, uid);
      return;
    }

    // Buscar planos ativos agora (não depender do useEffect)
    const resultado = await buscarPlanosAtivos(uid);
    if (!resultado.sucesso || !resultado.dados || resultado.dados.length === 0) {
      Alert.alert('Erro', 'Nenhum plano hormonal ativo encontrado. Adicione um medicamento primeiro.');
      return;
    }

    const planos = resultado.dados;

    if (planos.length === 1) {
      setPlanoIdResolvido(planos[0].id);
      await salvarAplicacao(planos[0].id, uid);
      return;
    }

    // Múltiplos planos ativos: deixar o usuário escolher
    const botoes = planos.map(plano => ({
      text: `${plano.nome} (${plano.dosagem}${plano.unidade_dosagem})`,
      onPress: () => salvarAplicacao(plano.id, uid),
    }));
    botoes.push({ text: 'Cancelar', onPress: () => {} });
    Alert.alert('Qual medicamento?', 'Selecione o plano para esta aplicação', botoes);
  };
  
  const handleAplicarDepois = () => {
    Alert.alert(
      'Lembrete',
      'Você será notificado novamente em 1 hora',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };
  
  const handlePularDose = () => {
    Alert.alert(
      'Pular esta dose?',
      'Esta ação não pode ser desfeita',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pular',
          style: 'destructive',
          onPress: () => {
            // TO-DO: Marcar como pulada no Supabase
            console.log('Dose pulada:', { hormonio, data, horario });
            router.back();
          },
        },
      ]
    );
  };
  
  const toggleEfeitoColateral = (efeito: string) => {
    setEfeitosColaterais(prev =>
      prev.includes(efeito)
        ? prev.filter(e => e !== efeito)
        : [...prev, efeito]
    );
  };
  
  const getEfeitosTexto = () => {
    if (efeitosColaterais.length === 0) return 'Nenhum';
    return efeitosColaterais.join(', ');
  };
  
  const renderHumorButton = (valor: number, emoji: string, label: string) => (
    <TouchableOpacity
      key={valor}
      style={[
        styles.humorButton,
        humor === valor && styles.humorButtonSelected,
      ]}
      onPress={() => setHumor(valor)}
    >
    <Ionicons 
        name={emoji as any} 
        size={28} 
        color={humor === valor ? colors.primary : colors.muted} 
    />
      <Text style={[
        styles.humorLabel,
        humor === valor && styles.humorLabelSelected,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <DismissKeyboard>
        <View style={styles.container}>
          <Header title="Registrar Aplicação" showBackButton />
          
          <ScrollView
            ref={formScrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Informações da Aplicação */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="medical-outline" size={20} color={colors.primary} />
                <Text style={styles.infoText}>{hormonio}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={styles.infoText}>
                  {new Date(data).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={styles.infoText}>Horário previsto: {horario}</Text>
              </View>
            </View>
            
            {/* Horário Real */}
            <Text style={styles.sectionTitle}>Confirmação</Text>
            <Input
              label="Horário real da aplicação (opcional)"
              placeholder="Ex: 08:15"
              value={horarioReal}
              onChangeText={setHorarioReal}
              keyboardType="numbers-and-punctuation"
            />
            <Text style={styles.hint}>
                Deixe em branco para usar o horário atual
            </Text>
            
            {/* Local de Aplicação - apenas para injetáveis */}
            {mostrarCampoLocal && (
              <>
                <Text style={styles.sectionTitle}>Local de Aplicação</Text>
                <Text style={styles.label}>Onde foi aplicado? *</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowLocalModal(true)}
                >
                  <Text style={localAplicacao ? styles.selectText : styles.selectPlaceholder}>
                    {localAplicacao || 'Selecionar local'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.hint}>
                    Importante fazer rotação de locais
                </Text>
              </>
            )}
            
            {/* Efeitos Colaterais */}
            <Text style={styles.sectionTitle}>Como você se sentiu?</Text>
            <Text style={styles.label}>Efeitos colaterais</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowEfeitosModal(true)}
            >
              <Text style={efeitosColaterais.length > 0 ? styles.selectText : styles.selectPlaceholder}>
                {getEfeitosTexto()}
              </Text>
            </TouchableOpacity>
            
            {/* Humor */}
            <Text style={styles.label}>Como está seu humor?</Text>
            <View style={styles.humorContainer}>
                {renderHumorButton(1, 'sad-outline', 'Ruim')}
                {renderHumorButton(2, 'happy-outline', 'Regular')}
                {renderHumorButton(3, 'remove-circle-outline', 'Neutro')}
                {renderHumorButton(4, 'happy-outline', 'Bom')}
                {renderHumorButton(5, 'happy-outline', 'Ótimo')}
            </View>
            
            {/* Observações */}
            <Text style={styles.sectionTitle}>Observações</Text>
            <Input
              label="Anotações (opcional)"
              placeholder="Ex: senti um pouco de dor..."
              value={observacoes}
              onChangeText={setObservacoes}
              multiline
              numberOfLines={3}
              style={{ height: 80 }}
              onFocus={() => {
                setTimeout(() => {
                  formScrollRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
            />
            
            {/* Botões de Ação */}
            <View style={styles.buttonContainer}>
              <Button
                title={salvando ? 'Registrando...' : '✓ Aplicado Agora'}
                onPress={handleAplicadoAgora}
                disabled={salvando}
              />
              
              <View style={{ marginTop: 12 }}>
                <Button
                  title="⏰ Aplicar Depois"
                  onPress={handleAplicarDepois}
                  variant="outline"
                />
              </View>
              
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handlePularDose}
              >
                <Text style={styles.skipButtonText}>Pular esta dose</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          {/* Modais */}
          <SelectModal
            visible={showLocalModal}
            title="Local de Aplicação"
            options={LOCAIS_APLICACAO}
            selectedValue={localAplicacao}
            onSelect={setLocalAplicacao}
            onClose={() => setShowLocalModal(false)}
          />
          
          {/* Modal de Efeitos - Multi-select */}
          <SelectModal
            visible={showEfeitosModal}
            title="Efeitos Colaterais"
            options={EFEITOS_COLATERAIS}
            selectedValue=""
            onSelect={(efeito) => {
              if (efeito === 'Nenhum') {
                setEfeitosColaterais([]);
              } else {
                toggleEfeitoColateral(efeito);
              }
            }}
            onClose={() => setShowEfeitosModal(false)}
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
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    marginTop: 0,
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
    marginBottom: 8,
    fontStyle: 'italic',
  },
  humorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  humorButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  humorButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFE8ED',
  },
  humorLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  humorLabelSelected: {
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
  buttonContainer: {
    marginTop: 16,
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
});
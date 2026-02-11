// to-do: resumo semanal funcional, 'visualizar historico de sessoes', melhorar a aparencia geral do registro de diario
// tirei o botao feio de configurações pq n tava fazendo nada mesmo

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DismissKeyboard from '@/components/DismissKeyboard';
import ErrorMessage from '@/components/ErrorMessage';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import Button from '@/components/Button';
import Input from '@/components/Input';
import CheckBox from '@/components/CheckBox';
import Calendar from '@/components/Calendar';
import { supabase } from '@/utils/supabase';
import {
  criarEntrada,
  buscarEntradasPorMes,
  atualizarEntrada,
  uploadFotoDiario,
} from '@/services/diario';
import type { EntradaDiario, NivelHumor } from '@/types/diario';

const MOODS = ['Feliz', 'Neutro', 'Triste', 'Ansioso', 'Irritado'];
const SYMPTOMS = ['Cansaço', 'Dores de cabeça', 'Insônia', 'Mudanças de apetite'];

// Mapeia os humores da UI para o enum do banco
const MOOD_TO_HUMOR: Record<string, NivelHumor> = {
  'Feliz': 'feliz',
  'Neutro': 'neutro',
  'Triste': 'triste',
  'Ansioso': 'ansioso',
  'Irritado': 'irritado',
};

const HUMOR_TO_MOOD: Record<NivelHumor, string> = {
  'feliz': 'Feliz',
  'neutro': 'Neutro',
  'triste': 'Triste',
  'ansioso': 'Ansioso',
  'irritado': 'Irritado',
};

/**
 * Extrai moods e symptoms de volta a partir das tags salvas no banco
 */
const extrairDasTags = (tags: string[] | null) => {
  if (!tags) return { moods: [], symptoms: [], otherSymptoms: '' };
  const moods = tags.filter(t => MOODS.includes(t));
  const symptoms = tags.filter(t => SYMPTOMS.includes(t));
  const outros = tags.filter(t => !MOODS.includes(t) && !SYMPTOMS.includes(t));
  return { moods, symptoms, otherSymptoms: outros.join(', ') };
};


export default function DiarioScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const formScrollRef = useRef<ScrollView>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<Record<string, EntradaDiario>>({});
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Estado do formulário
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [otherSymptoms, setOtherSymptoms] = useState('');
  const [emotionalDiary, setEmotionalDiary] = useState('');
  const [uploadandoFoto, setUploadandoFoto] = useState(false);
  const [fotoSelecionada, setFotoSelecionada] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Buscar usuário autenticado
  useEffect(() => {
    const buscarUsuario = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUsuarioId(data.user.id);
      }
    };
    buscarUsuario();
  }, []);

  // Carregar entradas do mês quando muda o mês ou o usuário é carregado
  const carregarEntradas = useCallback(async () => {
    if (!usuarioId) return;

    const ano = currentMonth.getFullYear();
    const mes = currentMonth.getMonth() + 1;
    const resultado = await buscarEntradasPorMes(usuarioId, ano, mes);

    if (resultado.sucesso && resultado.dados) {
      const mapa: Record<string, EntradaDiario> = {};
      for (const entrada of resultado.dados) {
        mapa[entrada.data_entrada] = entrada;
      }
      setEntries(mapa);
      setErro(null);
    } else {
      setErro(resultado.erro || 'Nao foi possivel carregar as entradas do diario.');
    }
  }, [usuarioId, currentMonth]);

  useEffect(() => {
    carregarEntradas();
  }, [carregarEntradas]);

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDayPress = (day: number) => {
    const dateStr = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setErro(null);
    setSelectedDate(dateStr);
    setFotoSelecionada(null); // Resetar foto ao trocar de data
    setFotoUrl(null);

    const entry = entries[dateStr];
    if (entry) {
      const { moods, symptoms, otherSymptoms: outros } = extrairDasTags(entry.tags);
      setSelectedMoods(moods.length > 0 ? moods : entry.humor ? [HUMOR_TO_MOOD[entry.humor]] : []);
      setSelectedSymptoms(symptoms);
      setOtherSymptoms(outros);
      setEmotionalDiary(entry.conteudo);
      setFotoUrl(entry.foto_url);
      setFotoSelecionada(entry.foto_url);
    } else {
      setSelectedMoods([]);
      setSelectedSymptoms([]);
      setOtherSymptoms('');
      setEmotionalDiary('');
    }
  };

  const handleRegisterToday = () => {
    const today = new Date();
    handleDayPress(today.getDate());
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const handleUploadFoto = useCallback(async () => {
    try {
      // Solicitar permissão
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'É necessário permissão para acessar a galeria de fotos.');
        return;
      }

      // Abrir seletor de imagem
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      const arquivo = result.assets[0];

      // Validar tipo de arquivo pela extensão
      const nomeArquivo = arquivo.fileName || arquivo.uri.split('/').pop() || '';
      const extensao = nomeArquivo.split('.').pop()?.toLowerCase() || '';
      const extensoesPermitidas = ['jpg', 'jpeg', 'png', 'webp'];

      if (!extensoesPermitidas.includes(extensao)) {
        Alert.alert('Tipo inválido', 'A imagem deve ser JPG, PNG ou WebP.');
        return;
      }

      // Validar tamanho (10 MB = 10485760 bytes)
      const TAMANHO_MAXIMO = 10 * 1024 * 1024; // 10 MB
      if (arquivo.fileSize && arquivo.fileSize > TAMANHO_MAXIMO) {
        Alert.alert('Arquivo muito grande', 'A imagem deve ter no máximo 10 MB.');
        return;
      }

      if (!usuarioId) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      setUploadandoFoto(true);

      // Mapear extensão para tipo MIME
      const tiposPermitidos: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp',
      };

      // Fazer upload
      const resultado = await uploadFotoDiario(
        {
          uri: arquivo.uri,
          name: arquivo.fileName || `foto_${Date.now()}.jpg`,
          type: tiposPermitidos[extensao] || 'image/jpeg',
        },
        usuarioId
      );

      if (resultado.sucesso && resultado.dados) {
        setFotoSelecionada(arquivo.uri);
        setFotoUrl(resultado.dados);
        Alert.alert('Sucesso', 'Foto selecionada! Salve a entrada para confirmar.');
      } else {
        Alert.alert('Erro', resultado.erro || 'Erro ao fazer upload da foto.');
      }
    } catch (erro) {
      console.error('Erro ao fazer upload de foto:', erro);
      Alert.alert('Erro', 'Ocorreu um erro ao fazer upload da foto.');
    } finally {
      setUploadandoFoto(false);
    }
  }, [usuarioId]);

  const handleSave = async () => {
    setErro(null);
    if (selectedMoods.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um humor');
      return;
    }

    if (!selectedDate || !usuarioId) return;

    setCarregando(true);

    // Montar tags a partir de moods + symptoms + otherSymptoms
    const tags = [
      ...selectedMoods,
      ...selectedSymptoms,
      ...(otherSymptoms.trim() ? [otherSymptoms.trim()] : []),
    ];

    // Mapear humor principal (primeiro mood selecionado)
    const humorPrincipal = MOOD_TO_HUMOR[selectedMoods[0]] || 'neutro';

    const entradaExistente = entries[selectedDate];

    try {
      let resultado;

      if (entradaExistente) {
        // Atualizar entrada existente
        resultado = await atualizarEntrada(entradaExistente.id, usuarioId, {
          conteudo: emotionalDiary || ' ',
          humor: humorPrincipal,
          tags,
          foto_url: fotoUrl,
        });
      } else {
        // Criar nova entrada
        resultado = await criarEntrada({
          usuario_id: usuarioId,
          data_entrada: selectedDate,
          conteudo: emotionalDiary || ' ',
          humor: humorPrincipal,
          tags,
          foto_url: fotoUrl,
        });
      }

      if (resultado.sucesso && resultado.dados) {
        setEntries(prev => ({ ...prev, [selectedDate]: resultado.dados! }));
        setErro(null);
        Alert.alert('Sucesso', 'Registro salvo!');
        setSelectedDate(null);
        setFotoSelecionada(null);
        setFotoUrl(null);
      } else {
        setErro(resultado.erro || 'Erro ao salvar registro');
      }
    } catch (erro) {
      console.error('Erro ao salvar:', erro);
      setErro('Ocorreu um erro ao salvar o registro');
    } finally {
      setCarregando(false);
    }
  };

  const calculateWeeklyStats = () => {
    const entriesArray = Object.values(entries);
    const hormoneApplications = entriesArray.length; // Mock
    const moodStability = entriesArray.length > 0 ? 75 : 0; // Mock
    return { hormoneApplications, moodStability };
  };

  const renderMainView = () => {
    const stats = calculateWeeklyStats();

    return (
      <ScrollView ref={scrollViewRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Meu diário</Text>
        </View>

        <ErrorMessage message={erro} />
        <Calendar
          currentMonth={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onDayPress={handleDayPress}
          markedDates={Object.keys(entries)}
          disableFutureDates={true}
        /> 

        <View style={styles.checkInSection}>
          <Text style={styles.sectionTitle}>Check-in de Hoje</Text>
            <Button title="Registrar diário" onPress={handleRegisterToday} />
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Resumo Semanal</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Aplicações Hormonais</Text>
              <Text style={styles.statValue}>{stats.hormoneApplications}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Estabilidade de Humor</Text>
              <Text style={styles.statValue}>{stats.moodStability}%</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={styles.historyLink}>Visualizar histórico de sessões</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderFormView = () => {
    return (
      <DismissKeyboard>
        <ScrollView ref={formScrollRef} style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.formHeader}>
            <TouchableOpacity onPress={() => {
              setSelectedDate(null);
              setFotoSelecionada(null);
              setFotoUrl(null);
            }}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.formTitle}>Como você está se sentindo hoje?</Text>
          </View>

          <ErrorMessage message={erro} />
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Registro de Humor</Text>
            <View style={styles.moodsContainer}>
              {MOODS.map(mood => (
                <TouchableOpacity
                  key={mood}
                  style={[
                    styles.moodButton,
                    selectedMoods.includes(mood) && styles.moodButtonSelected,
                  ]}
                  onPress={() => toggleMood(mood)}
                >
                  <Text
                    style={[
                      styles.moodButtonText,
                      selectedMoods.includes(mood) && styles.moodButtonTextSelected,
                    ]}
                  >
                    {mood}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Sintomas</Text>
            {SYMPTOMS.map(symptom => (
              <CheckBox
                key={symptom}
                label={symptom}
                checked={selectedSymptoms.includes(symptom)}
                onPress={() => toggleSymptom(symptom)}
              />
            ))}
            <Input
              placeholder="Outros"
              value={otherSymptoms}
              onChangeText={setOtherSymptoms}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Registrar foto</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUploadFoto}
              disabled={uploadandoFoto}
            >
              {uploadandoFoto ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.uploadButtonText}>
                  {fotoSelecionada ? '✓ Foto selecionada' : '📷 Upload'}
                </Text>
              )}
            </TouchableOpacity>
            <Text style={styles.uploadHint}>
              Máximo 10 MB • JPG, PNG ou WebP
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Diário Emocional</Text>
            <TextInput
              style={styles.diaryInput}
              placeholder="Escreva sobre seu dia..."
              placeholderTextColor={colors.muted}
              value={emotionalDiary}
              onChangeText={text => text.length <= 2000 && setEmotionalDiary(text)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              onFocus={() => {
                setTimeout(() => {
                  formScrollRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
            />
            <Text style={styles.charCount}>{emotionalDiary.length}/2000</Text>
          </View>
          <Button title="Salvar" onPress={handleSave} loading={carregando} />
        </ScrollView>
      </DismissKeyboard>
    );
  };

  return (
    <View style={styles.container}>
      {selectedDate ? renderFormView() : renderMainView()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  settingsIcon: {
    fontSize: 24,
  },
  checkInSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semibold,
    color: colors.text,
    marginBottom: 12,
  },
  summarySection: {
    marginBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  historyLink: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 28,
    color: colors.text,
    marginRight: 12,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: fonts.semibold,
    color: colors.text,
    flex: 1,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.text,
    marginBottom: 12,
  },
  moodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.white,
  },
  moodButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  moodButtonText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  moodButtonTextSelected: {
    color: colors.white,
    fontFamily: fonts.semibold,
  },
  uploadButton: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  uploadHint: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 8,
  },
  diaryInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
    textAlign: 'right',
    marginTop: 4,
  },
});

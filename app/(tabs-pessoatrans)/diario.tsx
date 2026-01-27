// todo: resumo semanal é uma farsa, upload de foto também, botao de configuraçoes tbm
// vou voltar aqui ainda porque ta muuito grande e acho que dá pra diminuir

import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import DismissKeyboard from '../../src/components/DismissKeyboard';
import { colors } from '../../src/theme/colors';
import { fonts } from '../../src/theme/fonts';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import CheckBox from '../../src/components/CheckBox';
import Calendar from '../../src/components/Calendar';

interface DiaryEntry {
  date: string;
  moods: string[];
  symptoms: string[];
  otherSymptoms: string;
  photo?: string;
  emotionalDiary: string;
}

const MOODS = ['Feliz', 'Neutro', 'Triste', 'Ansioso', 'Irritado'];
const SYMPTOMS = ['Cansaço', 'Dores de cabeça', 'Insônia', 'Mudanças de apetite'];


export default function DiarioScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const formScrollRef = useRef<ScrollView>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>({
    '2025-10-05': {
      date: '2025-10-05',
      moods: ['Feliz', 'Ansioso'],
      symptoms: ['Cansaço'],
      otherSymptoms: '',
      emotionalDiary: 'Hoje foi um dia produtivo!',
    },
    '2025-10-03': {
      date: '2025-10-03',
      moods: ['Neutro'],
      symptoms: ['Dores de cabeça', 'Insônia'],
      otherSymptoms: '',
      emotionalDiary: 'Tive dificuldades para dormir.',
    },
  });

  // Estado do formulário
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [otherSymptoms, setOtherSymptoms] = useState('');
  const [emotionalDiary, setEmotionalDiary] = useState('');

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const hasEntry = (date: string) => {
    return !!entries[date];
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDayPress = (day: number) => {
    const dateStr = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(dateStr);
    
    const entry = entries[dateStr];
    if (entry) {
      setSelectedMoods(entry.moods);
      setSelectedSymptoms(entry.symptoms);
      setOtherSymptoms(entry.otherSymptoms);
      setEmotionalDiary(entry.emotionalDiary);
    } else {
      setSelectedMoods([]);
      setSelectedSymptoms([]);
      setOtherSymptoms('');
      setEmotionalDiary('');
    }
  };

  const handleRegisterToday = () => {
    const today = new Date();
    const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
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

  const handleSave = () => {
    if (selectedMoods.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um humor');
      return;
    }

    if (!selectedDate) return;

    const newEntry: DiaryEntry = {
      date: selectedDate,
      moods: selectedMoods,
      symptoms: selectedSymptoms,
      otherSymptoms,
      emotionalDiary,
    };

    setEntries(prev => ({ ...prev, [selectedDate]: newEntry }));
    Alert.alert('Sucesso', 'Registro salvo!');
    setSelectedDate(null);
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
          <TouchableOpacity>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <Calendar
          currentMonth={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onDayPress={handleDayPress}
          markedDates={Object.keys(entries)}
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
            <TouchableOpacity onPress={() => setSelectedDate(null)}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.formTitle}>Como você está se sentindo hoje?</Text>
          </View>

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
              onPress={() => Alert.alert('Upload', 'Funcionalidade em desenvolvimento')}
            >
              <Text style={styles.uploadButtonText}>📷 Upload</Text>
            </TouchableOpacity>
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
          <Button title="Salvar" onPress={handleSave} />
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
    marginTop: 60,
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
    marginTop: 60,
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
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import DismissKeyboard from '../../src/components/DismissKeyboard';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../../src/theme/colors';
import { fonts } from '../../src/theme/fonts';


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
const scrollViewRef = useRef<ScrollView>(null);

export default function DiarioScreen() {
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

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

  const renderCalendar = () => {
    const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
    const days = [];
    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isToday = dateStr === formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
      const hasEntryMark = hasEntry(dateStr);

      days.push(
        <TouchableOpacity
          key={day}
          style={styles.dayCell}
          onPress={() => handleDayPress(day)}
        >
          <View style={[styles.dayNumber, isToday && styles.todayCircle]}>
            <Text style={[styles.dayText, isToday && styles.todayText]}>{day}</Text>
          </View>
          {hasEntryMark && <View style={styles.entryMark} />}
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={handlePreviousMonth}>
            <Text style={styles.monthArrow}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={handleNextMonth}>
            <Text style={styles.monthArrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysRow}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.weekDayCell}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.daysGrid}>{days}</View>
      </View>
    );
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

        {renderCalendar()}

        <View style={styles.checkInSection}>
          <Text style={styles.sectionTitle}>Check-in de Hoje</Text>
          <TouchableOpacity style={styles.registerButton} onPress={handleRegisterToday}>
            <Text style={styles.registerButtonText}>Registrar diário</Text>
          </TouchableOpacity>
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
              <TouchableOpacity
                key={symptom}
                style={styles.checkboxRow}
                onPress={() => toggleSymptom(symptom)}
              >
                <View style={[styles.checkbox, selectedSymptoms.includes(symptom) && styles.checkboxChecked]}>
                  {selectedSymptoms.includes(symptom) && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>{symptom}</Text>
              </TouchableOpacity>
            ))}
            <TextInput
              style={styles.otherInput}
              placeholder="Outros"
              placeholderTextColor={colors.muted}
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

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
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
  calendarContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.text,
    textTransform: 'capitalize',
  },
  monthArrow: {
    fontSize: 20,
    color: colors.text,
    paddingHorizontal: 12,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  dayNumber: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  todayCircle: {
    backgroundColor: colors.primary,
    borderRadius: 16,
  },
  todayText: {
    color: colors.white,
    fontFamily: fonts.semibold,
  },
  entryMark: {
    width: 4,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 2,
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
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.semibold,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.muted,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  otherInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    marginTop: 8,
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
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
});
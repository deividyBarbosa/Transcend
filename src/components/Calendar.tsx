import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface CalendarProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onDayPress: (day: number) => void;
  markedDates?: string[];
  selectedDay?: number;
  markedDatesStatus?: { [date: string]: 'aplicado' | 'atrasado' | 'pendente' };
  disableFutureDates?: boolean;
}

export default function Calendar({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  onDayPress,
  markedDates = [],
  selectedDay,  
  markedDatesStatus,
  disableFutureDates = false,
}: CalendarProps) {
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

  const isMarked = (date: string) => {
    return markedDates.includes(date);
  };

  const renderDays = () => {
    const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
    const days = [];
    const today = new Date();
    const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={[styles.dayCell]} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isToday = dateStr === todayStr;
      const hasEntry = isMarked(dateStr);
      const isFuture = disableFutureDates && (dateStr > todayStr);

      days.push(
        <TouchableOpacity
          key={day}
          disabled={isFuture}
          style={[
            styles.dayCell,
            isFuture && { opacity: 0.4 }
          ]}
          onPress={() => {
            if (isFuture) return;
            onDayPress(day);
          }}
        >
          <View style={[
            styles.dayNumber, 
            isToday && styles.todayCircle,
            selectedDay === day && styles.selectedCircle 
          ]}>
            <Text style={[
              styles.dayText, 
              (isToday || selectedDay === day) && styles.todayText  
            ]}>
              {day}
            </Text>
          </View>
          {hasEntry && (
            <View style={[
              styles.entryMark,
              markedDatesStatus?.[dateStr] === 'aplicado' && styles.entryMarkAplicado,
              markedDatesStatus?.[dateStr] === 'atrasado' && styles.entryMarkAtrasado,
              markedDatesStatus?.[dateStr] === 'pendente' && styles.entryMarkPendente,
            ]} />
          )}
        </TouchableOpacity>
      );
    }

    const totalCells = days.length;
    const remainder = totalCells % 7;

    if (remainder !== 0) {
      const toAdd = 7 - remainder;
      for (let i = 0; i < toAdd; i++) {
        days.push(
          <View key={`end-empty-${i}`} style={styles.dayCell} />
        );
      }
    }

    return days;
  };

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const monthLabel = (() => {
  const text = currentMonth.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return text.charAt(0).toUpperCase() + text.slice(1);
  })();

  
  return (
    <View style={styles.container}>
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={onPreviousMonth}>
          <Text style={styles.monthArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {monthLabel}
        </Text>
        <TouchableOpacity onPress={onNextMonth}>
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

      <View style={styles.daysGrid}>{renderDays()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    },
  monthArrow: {
    fontSize: 20,
    color: colors.text,
    paddingHorizontal: 12,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 10,
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
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  todayText: {
    color: colors.text,
    fontFamily: fonts.semibold,
  },
  entryMark: {
    width: 4,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 2,
  },
  selectedCircle: { 
    backgroundColor: colors.primary,
    borderRadius: 16,
  },
  entryMarkAplicado: {
  backgroundColor: '#4CAF50', 
  },
  entryMarkAtrasado: {
    backgroundColor: '#FF9800', 
  },
  entryMarkPendente: {
    backgroundColor: colors.primary, 
  },
  futureDayText: {
  color: colors.muted,
  },
});
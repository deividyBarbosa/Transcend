import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";

interface CalendarProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onDayPress: (day: number) => void;
  markedDates?: string[];
}

export default function PsicologoCalendar({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  onDayPress,
  markedDates = [],
}: CalendarProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const isMarked = (date: string) => {
    return markedDates.includes(date);
  };

  const renderDays = () => {
    const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
    const days = [];
    const today = new Date();
    const todayStr = formatDate(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      );
      const isToday = dateStr === todayStr;
      const hasEntry = isMarked(dateStr);

      days.push(
        <TouchableOpacity
          key={day}
          style={styles.dayCell}
          onPress={() => onDayPress(day)}
        >
          <View style={[styles.dayNumber, isToday && styles.todayCircle]}>
            <Text style={[styles.dayText, isToday && styles.todayText]}>
              {day}
            </Text>
          </View>
          {hasEntry && <View style={styles.entryMark} />}
        </TouchableOpacity>,
      );
    }

    return days;
  };

  const weekDays = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

  return (
    <View style={styles.container}>
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={onPreviousMonth} style={styles.arrowButton}>
          <Image
            source={require("@/assets/seta-esquerda.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {currentMonth.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </Text>
        <TouchableOpacity onPress={onNextMonth} style={styles.arrowButton}>
          <Image
            source={require("@/assets/seta-direita.png")}
            style={styles.image}
            resizeMode="contain"
          />
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
    backgroundColor: "#E3D4D6",
    marginBottom: 20,
    borderRadius: 20,
    padding: 12,
    width: 300,
    height: 280,
    alignSelf: "center",
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  monthText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.text,
    textTransform: "capitalize",
  },
  arrowButton: {
    padding: 4,
    
  },
  monthArrow: {
    fontSize: 18,
    color: colors.text,
  },
  weekDaysRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  weekDayCell: {
    flex: 1,
    alignItems: "center",
  },
  weekDayText: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 2,
  },
  dayNumber: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  todayCircle: {
    backgroundColor: colors.primary,
    borderRadius: 14,
  },
  todayText: {
    color: colors.white,
    fontFamily: fonts.semibold,
  },
  entryMark: {
    width: 3,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
    marginTop: 1,
  },
  image:{
    width:24,
    height:24,
  }
});

import { colors } from "@/theme/colors";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { PsychologistHeader } from "@/components/psicologo/PsicologoHeader";
import PsicologoCalendar from "@/components/psicologo/PsicologoCalendar";
import Button from "@/components/Button";
import { ConsultaCard } from "@/components/psicologo/ConsultaCard";

export default function PsicologoHome() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [markedDates, setMarkedDates] = useState<string[]>([
    "2025-01-30",
    "2025-02-05",
    "2025-02-12",
  ]);

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleDayPress = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    console.log("Dia selecionado:", dateStr);

    // Aqui você pode navegar para uma tela de detalhes do dia
    // ou mostrar um modal com as consultas do dia
    // router.push(`/consultas/${dateStr}`);
  };

  return (
    <View style={styles.container}>
      <PsychologistHeader pendingRequestsCount={3} />

      <Button
        title="Acompanhar solicitações"
        onPress={() => router.push("")} // Adicione a rota correta
        loading={carregando}
        style={styles.button}
      />

      <View style={styles.calendarContainer}>
        <PsicologoCalendar
          currentMonth={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onDayPress={handleDayPress}
          markedDates={markedDates}
        />
      </View>
      <View style={styles.consultaContainer}>
        <ConsultaCard
          pacientName="Lucas"
          dataConsulta={new Date(2025, 1, 5)} 
          horaInicio="10:00"
          horaFim="11:00"
        />
        <ConsultaCard
          pacientName="Sofia"
          dataConsulta={new Date(2026, 2, 6)} 
          horaInicio="09:00"
          horaFim="10:00"
        />
      </View>
      <Button
        title="Ver mais"
        onPress={() => router.push("")} 
        loading={carregando}
        style={{
          width: 360,
          height: 40,
          alignSelf: "center",
          marginTop: 10,
        }}
      />
      <Button
        title="Lista completa de atendimentos"
        onPress={() => router.push("")} // Adicione a rota correta
        loading={carregando}
        style={{
          width: 360,
          height: 40,
          alignSelf: "center",
          marginTop: 9,
          backgroundColor: "#cf98a0",
          
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  button: {
    width: 253,
    height: 36,
    marginTop: 16,
    alignSelf: "center",
  },
  calendarContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  consultaContainer: {
    gap:10,
    
  },
});

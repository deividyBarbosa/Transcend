import React, { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";

import { colors } from "@/theme/colors";
import { PsychologistHeader } from "@/components/psicologo/PsicologoHeader";
import PsicologoCalendar from "@/components/psicologo/PsicologoCalendar";
import Button from "@/components/Button";
import { ConsultaCard } from "@/components/psicologo/ConsultaCard";

interface Consulta {
  id: string;
  pacientName: string;
  dataConsulta: Date;
  horaInicio: string;
  horaFim: string;
}

const MOCK_CONSULTAS: Consulta[] = [
  {
    id: "1",
    pacientName: "Lucas Silva",
    dataConsulta: new Date(2026, 0, 31),
    horaInicio: "10:00",
    horaFim: "11:00",
  },
  {
    id: "2",
    pacientName: "Sofia Oliveira",
    dataConsulta: new Date(2026, 1, 1),
    horaInicio: "14:00",
    horaFim: "15:00",
  },
  {
    id: "3",
    pacientName: "Pedro Santos",
    dataConsulta: new Date(2026, 0, 31),
    horaInicio: "09:00",
    horaFim: "10:00",
  },
];

export default function PsicologoHome() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>(MOCK_CONSULTAS);

  const markedDates = useMemo(() => {
    return consultas.map((consulta) => {
      const year = consulta.dataConsulta.getFullYear();
      const month = String(consulta.dataConsulta.getMonth() + 1).padStart(
        2,
        "0",
      );
      const day = String(consulta.dataConsulta.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    });
  }, [consultas]);

  const proximasConsultas = useMemo(() => {
    const hoje = new Date();
    const anoHoje = hoje.getFullYear();
    const mesHoje = hoje.getMonth();
    const diaHoje = hoje.getDate();

    return consultas
      .filter((consulta) => {
        const ano = consulta.dataConsulta.getFullYear();
        const mes = consulta.dataConsulta.getMonth();
        const dia = consulta.dataConsulta.getDate();

        if (ano > anoHoje) return true;
        if (ano < anoHoje) return false;

        if (mes > mesHoje) return true;
        if (mes < mesHoje) return false;

        return dia >= diaHoje;
      })
      .sort((a, b) => a.dataConsulta.getTime() - b.dataConsulta.getTime())
      .slice(0, 3);
  }, [consultas]);

  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  }, []);

  const handleDayPress = useCallback(
    (day: number) => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      setSelectedDate(dateStr);
      router.push(`/consultas/${dateStr}`);
    },
    [currentMonth, router],
  );

  const handleSolicitacoesPress = useCallback(() => {
    router.push("/solicitacoes");
  }, [router]);

  const handleVerMaisPress = useCallback(() => {
    router.push("/consultas");
  }, [router]);

  const handleListaCompletaPress = useCallback(() => {
    router.push("/atendimentos");
  }, [router]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      <PsychologistHeader pendingRequestsCount={3} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.actionsSection}>
          <Button
            title="Acompanhar solicitações"
            onPress={handleSolicitacoesPress}
            loading={isLoading}
            style={styles.primaryButton}
          />
        </View>

        <View style={styles.calendarSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Agenda</Text>
            <Text style={styles.sectionSubtitle}>
              {proximasConsultas.length} consulta(s) próxima(s)
            </Text>
          </View>

          <PsicologoCalendar
            currentMonth={currentMonth}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            onDayPress={handleDayPress}
            markedDates={markedDates}
          />
        </View>

        <View style={styles.consultasSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximas consultas</Text>
            <TouchableOpacity onPress={handleVerMaisPress}>
              <Text style={styles.verMaisText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {proximasConsultas.length > 0 ? (
            <View style={styles.consultasList}>
              {proximasConsultas.map((consulta) => (
                <ConsultaCard
                  key={consulta.id}
                  pacientName={consulta.pacientName}
                  dataConsulta={consulta.dataConsulta}
                  horaInicio={consulta.horaInicio}
                  horaFim={consulta.horaFim}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Nenhuma consulta agendada
              </Text>
            </View>
          )}

          <View style={styles.buttonsContainer}>
            <Button
              title="Ver mais consultas"
              onPress={handleVerMaisPress}
              style={styles.secondaryButton}
            />
            <Button
              title="Lista completa de atendimentos"
              onPress={handleListaCompletaPress}
              style={styles.tertiaryButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  actionsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  primaryButton: {
    height: 48,
    borderRadius: 12,
  },
  calendarSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "black",
  },
  verMaisText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary || "#D65C73",
  },
  consultasSection: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  consultasList: {
    gap: 12,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "black",
  },
  buttonsContainer: {
    marginTop: 20,
    gap: 12,
  },
  secondaryButton: {
    height: 48,
    borderRadius: 12,
  },
  tertiaryButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#cf98a0",
  },
});

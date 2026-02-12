import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";

import { colors } from "@/theme/colors";

type ConsultaCardProps = {
  pacientName: string;
  dataConsulta: Date;
  horaInicio: string;
  horaFim: string;
  pacientPhoto?: ImageSourcePropType;
  onPress?: () => void;
  status?: "agendada" | "concluida" | "cancelada";
};

export function ConsultaCard({
  pacientName,
  dataConsulta,
  horaInicio,
  horaFim,
  pacientPhoto,
  onPress,
  status = "agendada",
}: ConsultaCardProps) {
  const formattedDate = useMemo(() => {
    const dia = dataConsulta.getDate().toString().padStart(2, "0");
    const mes = (dataConsulta.getMonth() + 1).toString().padStart(2, "0");
    const ano = dataConsulta.getFullYear();

    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    const hojeComparacao = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
    );
    const amanhaComparacao = new Date(
      amanha.getFullYear(),
      amanha.getMonth(),
      amanha.getDate(),
    );
    const dataComparacao = new Date(
      dataConsulta.getFullYear(),
      dataConsulta.getMonth(),
      dataConsulta.getDate(),
    );

    if (dataComparacao.getTime() === hojeComparacao.getTime()) {
      return "Hoje";
    } else if (dataComparacao.getTime() === amanhaComparacao.getTime()) {
      return "Amanhã";
    }

    return `${dia}/${mes}/${ano}`;
  }, [dataConsulta]);

  const formattedTime = useMemo(() => {
    return `${horaInicio} - ${horaFim}`;
  }, [horaInicio, horaFim]);

  const statusConfig = useMemo(() => {
    switch (status) {
      case "concluida":
        return {
          color: "#4CAF50",
          text: "Concluída",
          backgroundColor: "#E8F5E9",
        };
      case "cancelada":
        return {
          color: "#F44336",
          text: "Cancelada",
          backgroundColor: "#FFEBEE",
        };
      default:
        return {
          color: "#2196F3",
          text: "Agendada",
          backgroundColor: "#E3F2FD",
        };
    }
  }, [status]);

  const CardContent = (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        {pacientPhoto ? (
          <Image source={pacientPhoto} style={styles.pacientPhoto} />
        ) : (
          <Image
            source={require("@/assets/calendario-icon.png")}
            style={styles.calendarIcon}
            resizeMode="contain"
          />
        )}
      </View>

      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {pacientName}
        </Text>
        <View style={styles.detailsContainer}>
          <Text style={styles.cardDate}>{formattedDate}</Text>
          <View style={styles.separator} />
          <Text style={styles.cardTime}>{formattedTime}</Text>
        </View>
      </View>

      {status !== "agendada" && (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.text}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{CardContent}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarIcon: {
    width: 48,
    height: 48,
  },
  pacientPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  cardTextContainer: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    color: "#000",
    fontWeight: "600",
    marginBottom: 6,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDate: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#999",
    marginHorizontal: 8,
  },
  cardTime: {
    fontSize: 14,
    color: "#8F5761",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

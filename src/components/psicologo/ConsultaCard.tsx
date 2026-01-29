import { View, Text, StyleSheet, Image } from "react-native";

type ConsultaCardProps = {
  pacientName: string;
  dataConsulta: Date; 
  horaInicio: string; 
  horaFim: string;
};

export function ConsultaCard({
  pacientName,
  dataConsulta,
  horaInicio,
  horaFim,
}: ConsultaCardProps) {

  const formatarData = (data: Date): string => {
    const dia = data.getDate().toString().padStart(2, "0");
    const mes = (data.getMonth() + 1).toString().padStart(2, "0");
    return `${dia}/${mes}`;
  };

  const formatarHorario = (): string => {
    return `${horaInicio} - ${horaFim}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require("../../assets/calendario-icon.png")}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Consulta com {pacientName}</Text>
          <Text style={styles.cardHorario}>
            {formatarData(dataConsulta)} - {formatarHorario()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    width: "100%",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  cardTextContainer: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 18,
    color: "#000",
    fontWeight: "600",
    marginBottom: 4,
  },
  cardHorario: {
    fontSize: 15,
    color: "#8F5761",
    fontWeight: "400",
  },
  image: {
    width: 48,
    height: 48,
  },
});

import { View, Text, StyleSheet, Image } from "react-native";

type PsychologistHeaderProps = {
  pendingRequestsCount?: number; 
};

export function PsychologistHeader({
  pendingRequestsCount = 0,
}: PsychologistHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardLabel}>Solicitações pendentes:</Text>

          <Text style={styles.cardCount}>{pendingRequestsCount}</Text>

          <Text style={styles.cardDescription}>
            Novas solicitações de pacientes
          </Text>
        </View>
        <Image
          source={require("@/assets/header-illustration.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 50,
    width: "100%",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  cardTextContainer: {
    flex: 1,
    paddingRight: 12,
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 16,
    color: "#8F5761",
    fontWeight: "500",
  },
  cardCount: {
    fontSize: 24,
    fontWeight: "700",
    marginVertical: 6,
    color: "#000",
  },
  cardDescription: {
    fontSize: 15,
    color: "#8F5761",
  },
  image: {
    width: 133,
    height: 70,
    marginRight: -8,
  },
});

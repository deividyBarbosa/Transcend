import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

import Button from "@/components/Button";
import { colors } from "@/theme/colors";

type PacienteCardProps = {
  pacientName: string;
  pacientPhoto: ImageSourcePropType;
  pacientAge: number;
  pacientId?: string;
  onPress?: () => void;
};

export function PacienteCard({
  pacientName,
  pacientPhoto,
  pacientAge,
  pacientId,
  onPress,
}: PacienteCardProps) {
  const router = useRouter();

  const handleChatPress = useCallback(() => {
    router.push(`/chat/${pacientId}`);
  }, [router, pacientId]);

  const handleReportsPress = useCallback(() => {
    router.push(`/relatorios/${pacientId}`);
  }, [router, pacientId]);

  const CardContent = (
    <View style={styles.card}>
      <Image source={pacientPhoto} style={styles.image} />

      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {pacientName}
        </Text>
        <Text style={styles.cardDescription}>{pacientAge} anos</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Ver chat"
          onPress={handleChatPress}
          style={styles.chatButton}
        />
        <Button
          title="Relatórios"
          onPress={handleReportsPress}
          style={styles.reportsButton}
        />
      </View>
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
  image: {
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
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    fontWeight: "400",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 5,
    
  },
  chatButton: {
    width: 84,
    height: 26,
    backgroundColor: "#d68fa1",
  },
  reportsButton: {
    width: 84,
    height: 26,
    backgroundColor: "#D65C73",
  },
});

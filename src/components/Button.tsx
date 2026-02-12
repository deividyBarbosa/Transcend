import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "outline";
  fullWidth?: boolean;
  style?: ViewStyle; // Estilo customizado para o botão
  textStyle?: TextStyle; // Estilo customizado para o texto
}

export default function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary",
  fullWidth = true,
  style,
  textStyle,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "outline" && styles.outline,
        (disabled || loading) && styles.disabled,
        !fullWidth && styles.auto,
        style, // aplica o estilo customizado por último para sobrescrever os estilos padrão
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? colors.primary : colors.white}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "outline" && styles.outlineText,
            textStyle, // aplica o estilo customizado do texto
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 55,
    backgroundColor: colors.primary,
    borderRadius: 27.5,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  auto: {
    width: "auto",
    paddingHorizontal: 30,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.semibold,
    textAlign: "center",
  },
  outlineText: {
    color: colors.primary,
  },
});

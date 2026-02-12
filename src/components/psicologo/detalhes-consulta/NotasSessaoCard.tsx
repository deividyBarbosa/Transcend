import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";

interface NotasSessaoCardProps {
  notes: string;
  onNotesChange?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function NotasSessaoCard({
  notes: initialNotes,
  onNotesChange,
  placeholder = "Começar a escrever suas observações sobre a sessão.",
  editable = true,
}: NotasSessaoCardProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaved, setIsSaved] = useState(false);

  const handleNotesChange = (text: string) => {
    setNotes(text);
    setIsSaved(true);
    onNotesChange?.(text);

    setTimeout(() => {
      setIsSaved(true);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notas da Sessão</Text>
        {isSaved && notes.length > 0 && (
          <Text style={styles.savedLabel}>Salvo automaticamente</Text>
        )}
      </View>

      <TextInput
        style={styles.input}
        value={notes}
        onChangeText={handleNotesChange}
        placeholder={placeholder}
        placeholderTextColor="#CCCCCC"
        multiline
        editable={editable}
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  savedLabel: {
    fontSize: 12,
    fontWeight: "400",
    color: "#999999",
  },
  input: {
    fontSize: 14,
    fontWeight: "400",
    color: "#666666",
    lineHeight: 20,
    minHeight: 60,
    paddingVertical: 0,
  },
});

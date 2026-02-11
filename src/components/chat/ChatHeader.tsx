// to-do: tirar tudo de chamada dentro do app

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

interface ChatHeaderProps {
  nome: string;
  foto: ImageSourcePropType;
  onBack: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
}

export default function ChatHeader({
  nome,
  foto,
  onBack,
  onCall,
  onVideoCall,
}: ChatHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Image source={foto} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.nome}>{nome}</Text>
      </View>
      {onCall && (
        <TouchableOpacity style={styles.button} onPress={onCall}>
          <Ionicons name="call-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      {onVideoCall && (
        <TouchableOpacity style={styles.button} onPress={onVideoCall}>
          <Ionicons name="videocam-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  info: {
    flex: 1,
  },
  nome: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
  status: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  statusOnline: {
    color: '#4CAF50',
  },
  button: {
    padding: 4,
  },
});
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import type { Conversa } from '@/mocks/mockChat';
import { formatarTimestamp } from '@/mocks/mockChat';

interface ConversaItemProps {
  conversa: Conversa;
  onPress: () => void;
}

export default function ConversaItem({ conversa, onPress }: ConversaItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: conversa.psicologoFoto }} style={styles.avatar} />
        {conversa.naoLidas > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{conversa.naoLidas}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.nome}>{conversa.psicologoNome}</Text>
          <Text style={styles.timestamp}>
            {formatarTimestamp(conversa.timestampUltimaMensagem)}
          </Text>
        </View>
        <Text
          style={[styles.ultimaMensagem, conversa.naoLidas > 0 && styles.ultimaMensagemNaoLida]}
          numberOfLines={1}
        >
          {conversa.ultimaMensagem}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0E0E0',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nome: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
  timestamp: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  ultimaMensagem: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  ultimaMensagemNaoLida: {
    fontFamily: fonts.semibold,
    color: colors.text,
  },
});
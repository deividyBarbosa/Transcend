import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import type { Mensagem } from '@/mocks/mockChat';
import { formatarHoraMensagem } from '@/mocks/mockChat';

interface MensagemBubbleProps {
  mensagem: Mensagem;
  isMinha: boolean;
  avatarUrl?: string;
}

export default function MensagemBubble({ mensagem, isMinha, avatarUrl }: MensagemBubbleProps) {
  const isSistema = mensagem.remetenteTipo === 'sistema';

  if (isSistema) {
    return (
      <View style={styles.sistemaContainer}>
        <View style={styles.sistemaBubble}>
          <Text style={styles.sistemaTexto}>{mensagem.conteudo}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isMinha && styles.minhaContainer]}>
      {!isMinha && avatarUrl && (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      )}
      <View style={[styles.bubble, isMinha ? styles.minhaBubble : styles.outroBubble]}>
        <Text style={[styles.texto, isMinha && styles.minhaTexto]}>
          {mensagem.conteudo}
        </Text>
        <Text style={[styles.hora, isMinha && styles.minhaHora]}>
          {formatarHoraMensagem(mensagem.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    maxWidth: '80%',
  },
  minhaContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%',
  },
  minhaBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  outroBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },
  texto: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  minhaTexto: {
    color: colors.white,
  },
  hora: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    alignSelf: 'flex-end',
  },
  minhaHora: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sistemaContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  sistemaBubble: {
    backgroundColor: '#FFE8ED',
    borderRadius: 12,
    padding: 12,
    maxWidth: '90%',
  },
  sistemaTexto: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 18,
  },
});
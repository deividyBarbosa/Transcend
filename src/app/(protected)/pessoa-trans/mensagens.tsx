import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import ConversaItem from '@/components/ConversaItem';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { CONVERSAS_MOCK } from '@/mocks/mockChat';

export default function MensagensScreen() {
  const router = useRouter();
  const [bannerVisivel, setBannerVisivel] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header title="Mensagens" showBackButton />

      <View style={styles.container}>
        {/* Banner de aviso */}
        {bannerVisivel && (
          <View style={styles.banner}>
            <View style={styles.bannerContent}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>Pagamentos e honorários</Text>
                <Text style={styles.bannerSubtitle}>
                  Os pagamentos são tratados diretamente com seu psicólogo, fora da plataforma
                  Transcend.
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setBannerVisivel(false)}>
              <Ionicons name="close" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de conversas */}
        <FlatList
          data={CONVERSAS_MOCK}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversaItem
              conversa={item}
              onPress={() => router.push(`/pessoa-trans/chat?conversaId=${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.muted} style={{ opacity: 0.3 }} />
              <Text style={styles.emptyText}>Nenhuma conversa ainda</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  banner: {
    backgroundColor: '#FFE8ED',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.muted,
    marginTop: 16,
  },
});
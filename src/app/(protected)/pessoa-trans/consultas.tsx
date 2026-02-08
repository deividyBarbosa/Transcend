// to-do: o circulo de mensagens não lidas está meio cortado, tem que arrumar isso depois 

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import Button from '@/components/Button';
import ConsultaItem from '@/components/ConsultaItem';
import { PacienteChatCard } from '@/components/psicologo/PacienteChatCard';
import { SearchInput } from '@/components/Input/SearchInput';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import {
  getConsultasAgendadas,
  getConsultasRealizadas,
} from '@/mocks/mockConsultas';
import { CONVERSAS_MOCK, isRecente } from '@/mocks/mockChat';

type TabType = 'agendadas' | 'realizadas' | 'mensagens';

export default function ConsultasScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('agendadas');
  const [bannerVisivel, setBannerVisivel] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredConversas, setFilteredConversas] = useState(CONVERSAS_MOCK);

  const consultasAgendadas = getConsultasAgendadas();
  const consultasRealizadas = getConsultasRealizadas();

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredConversas(CONVERSAS_MOCK);
      return;
    }
    const filtered = CONVERSAS_MOCK.filter(c =>
      c.psicologoNome.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredConversas(filtered);
  };

  const getTotalUnread = () => CONVERSAS_MOCK.reduce((sum, c) => sum + c.naoLidas, 0);

  const EmptyStateConsultas = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={colors.muted} style={{ opacity: 0.3 }} />
      <Text style={styles.emptyText}>
        {activeTab === 'agendadas'
          ? 'Você não tem consultas agendadas'
          : 'Nenhuma consulta realizada ainda'}
      </Text>
      {activeTab === 'agendadas' && (
        <Button
          title="Agendar Consulta"
          onPress={() => router.push('/pessoa-trans/agendamento/agendar-psicologo')}
          style={{ minWidth: 200, marginTop: 24 }}
        />
      )}
    </View>
  );

  const EmptyStateMensagens = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color={colors.muted} style={{ opacity: 0.3 }} />
      <Text style={styles.emptyText}>Nenhuma conversa ainda</Text>
    </View>
  );

  const renderMensagensTab = () => (
    <View style={{ flex: 1 }}>
      {bannerVisivel && (
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Pagamentos e honorários</Text>
              <Text style={styles.bannerSubtitle}>
                Os pagamentos são tratados diretamente com seu psicólogo, fora da plataforma Transcend.
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setBannerVisivel(false)}>
            <Ionicons name="close" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.searchWrapper}>
        <SearchInput value={searchText} onChangeText={handleSearch} placeholder="Buscar psicólogo..." />
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>{filteredConversas.length} conversa(s)</Text>
        {getTotalUnread() > 0 && (
          <>
            <View style={styles.statsDot} />
            <Text style={styles.statsUnread}>{getTotalUnread()} não lida(s)</Text>
          </>
        )}
      </View>

      <FlatList
        data={filteredConversas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PacienteChatCard
            pacientId={item.psicologoId}
            pacientName={item.psicologoNome}
            pacientPhoto={{ uri: item.psicologoFoto }}
            lastMessage={item.ultimaMensagem}
            lastMessageTime="Hoje"
            unreadCount={item.naoLidas}
            isActive={new Date(item.timestampUltimaMensagem).getTime() > Date.now() - 86400000}
            onPress={() => router.push(`/pessoa-trans/chat?conversaId=${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContentMensagens}
        ListEmptyComponent={<EmptyStateMensagens />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header title="Minhas Consultas" showBackButton />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'agendadas' && styles.tabActive]}
          onPress={() => setActiveTab('agendadas')}
        >
          <Text style={[styles.tabText, activeTab === 'agendadas' && styles.tabTextActive]}>
            Agendadas ({consultasAgendadas.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'realizadas' && styles.tabActive]}
          onPress={() => setActiveTab('realizadas')}
        >
          <Text style={[styles.tabText, activeTab === 'realizadas' && styles.tabTextActive]}>
            Realizadas ({consultasRealizadas.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mensagens' && styles.tabActive]}
          onPress={() => setActiveTab('mensagens')}
        >
          <Text style={[styles.tabText, activeTab === 'mensagens' && styles.tabTextActive]}>
            Mensagens ({CONVERSAS_MOCK.filter(c => c.naoLidas > 0).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo das tabs */}
      {activeTab === 'mensagens' ? (
        renderMensagensTab()
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'agendadas' && (
            <>
              {consultasAgendadas.length > 0 ? (
                <>
                  {consultasAgendadas.map(consulta => (
                    <ConsultaItem
                      key={consulta.id}
                      consulta={consulta}
                      onPress={() => router.push(`/pessoa-trans/consulta-detalhes?id=${consulta.id}`)}
                      onEntrarConsulta={() => console.log('Entrar:', consulta.link)}
                    />
                  ))}
                  <Button
                    title="+ Agendar Nova Consulta"
                    onPress={() => router.push('/pessoa-trans/agendamento/agendar-psicologo')}
                    variant="outline"
                    style={{ marginTop: 12 }}
                  />
                </>
              ) : (
                <EmptyStateConsultas />
              )}
            </>
          )}

          {activeTab === 'realizadas' && (
            <>
              {consultasRealizadas.length > 0
                ? consultasRealizadas.map(consulta => (
                    <ConsultaItem
                      key={consulta.id}
                      consulta={consulta}
                      onPress={() => router.push(`/pessoa-trans/consulta-detalhes?id=${consulta.id}`)}
                    />
                  ))
                : <EmptyStateConsultas />}
            </>
          )}
        </ScrollView>
      )}
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.background,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.primary,
    fontFamily: fonts.semibold,
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
    textAlign: 'center',
  },
  banner: {
    backgroundColor: '#FFE8ED',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  searchWrapper: {
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  statsDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginHorizontal: 8,
  },
  statsUnread: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  listContentMensagens: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
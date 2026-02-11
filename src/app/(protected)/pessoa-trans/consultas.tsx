// to-do: o circulo de mensagens nao lidas esta meio cortado, tem que arrumar isso depois

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Header from '@/components/Header';
import Button from '@/components/Button';
import ConsultaItem from '@/components/ConsultaItem';
import { PacienteChatCard } from '@/components/psicologo/PacienteChatCard';
import { SearchInput } from '@/components/Input/SearchInput';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import type { Consulta } from '@/mocks/mockConsultas';
import { CONVERSAS_MOCK } from '@/mocks/mockChat';
import { obterUsuarioAtual } from '@/services/auth';
import { listarSessoesPaciente, type SessaoPacienteAgenda } from '@/services/agendamento';

type TabType = 'agendadas' | 'realizadas' | 'mensagens';

const dataISO = (valor: string) => {
  const d = new Date(valor);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

const horaBR = (valor: string) => {
  const d = new Date(valor);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const mapearConsulta = (sessao: SessaoPacienteAgenda): Consulta => {
  const status = (sessao.status || 'agendada').toLowerCase();
  const statusNormalizado: Consulta['status'] =
    status === 'realizada' ? 'realizada' : status === 'cancelada' ? 'cancelada' : 'agendada';

  const statusLabel =
    status === 'agendada'
      ? 'Aguardando confirmacao do psicologo'
      : status === 'confirmada'
        ? 'Confirmada'
        : status === 'remarcada'
          ? 'Remarcada'
          : status === 'cancelada'
            ? 'Cancelada'
            : status === 'realizada'
              ? 'Realizada'
              : undefined;

  return {
    id: sessao.id,
    psicologoId: sessao.psicologo_id,
    psicologoNome: sessao.psicologo_nome,
    data: dataISO(sessao.data_sessao),
    horario: horaBR(sessao.data_sessao),
    status: statusNormalizado,
    tipo: sessao.modalidade === 'presencial' ? 'presencial' : 'online',
    link: sessao.link_videochamada || undefined,
    statusLabel,
  };
};

export default function ConsultasScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('agendadas');
  const [bannerVisivel, setBannerVisivel] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredConversas, setFilteredConversas] = useState(CONVERSAS_MOCK);
  const [consultasTodas, setConsultasTodas] = useState<Consulta[]>([]);
  const [carregandoConsultas, setCarregandoConsultas] = useState(false);

  const consultasAgendadas = useMemo(
    () => consultasTodas.filter(c => c.status === 'agendada'),
    [consultasTodas]
  );
  const consultasRealizadas = useMemo(
    () => consultasTodas.filter(c => c.status === 'realizada' || c.status === 'cancelada'),
    [consultasTodas]
  );

  const carregarConsultas = useCallback(async () => {
    setCarregandoConsultas(true);
    const usuario = await obterUsuarioAtual();
    if (!usuario?.id) {
      setConsultasTodas([]);
      setCarregandoConsultas(false);
      return;
    }

    const resultado = await listarSessoesPaciente(usuario.id);
    if (!resultado.sucesso || !resultado.dados) {
      setConsultasTodas([]);
      setCarregandoConsultas(false);
      return;
    }

    setConsultasTodas(resultado.dados.map(mapearConsulta));
    setCarregandoConsultas(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarConsultas();
    }, [carregarConsultas])
  );

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredConversas(CONVERSAS_MOCK);
      return;
    }
    const filtered = CONVERSAS_MOCK.filter(c => c.psicologoNome.toLowerCase().includes(text.toLowerCase()));
    setFilteredConversas(filtered);
  };

  const getTotalUnread = () => CONVERSAS_MOCK.reduce((sum, c) => sum + c.naoLidas, 0);

  const EmptyStateConsultas = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={colors.muted} style={{ opacity: 0.3 }} />
      <Text style={styles.emptyText}>
        {activeTab === 'agendadas' ? 'Voce nao tem consultas agendadas' : 'Nenhuma consulta realizada ainda'}
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
              <Text style={styles.bannerTitle}>Pagamentos e honorarios</Text>
              <Text style={styles.bannerSubtitle}>
                Os pagamentos sao tratados diretamente com seu psicologo, fora da plataforma Transcend.
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setBannerVisivel(false)}>
            <Ionicons name="close" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.searchWrapper}>
        <SearchInput value={searchText} onChangeText={handleSearch} placeholder="Buscar psicologo..." />
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>{filteredConversas.length} conversa(s)</Text>
        {getTotalUnread() > 0 && (
          <>
            <View style={styles.statsDot} />
            <Text style={styles.statsUnread}>{getTotalUnread()} nao lida(s)</Text>
          </>
        )}
      </View>

      <FlatList
        data={filteredConversas}
        keyExtractor={item => item.id}
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
            Historico ({consultasRealizadas.length})
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

      {activeTab === 'mensagens' ? (
        renderMensagensTab()
      ) : carregandoConsultas ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'agendadas' && (
            <>
              {consultasAgendadas.length > 0 ? (
                <>
                  {consultasAgendadas.map(consulta => (
                    <ConsultaItem
                      key={consulta.id}
                      consulta={consulta}
                      onPress={() => router.push(`/pessoa-trans/consulta-detalhes?id=${consulta.id}`)}
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
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

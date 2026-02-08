import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import { supabase } from '@/utils/supabase';
import { 
  HORMONIOS_MOCK, 
  calcularEstatisticas, 
  getProximaAplicacao,
  getAplicacoesHoje,
  getHumorMedio 
} from '@/mocks/mockPlanoHormonal';

export default function InicioScreen() {
  const [nome, setNome] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    carregarNomeUsuario();
  }, []);

  const carregarNomeUsuario = async () => {
    try {
      // Obter usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Erro ao obter usuário:', authError);
        setNome('Usuário');
        return;
      }

      // Buscar perfil do usuário
      const { data: perfil, error: perfilError } = await supabase
        .from('perfis')
        .select('nome')
        .eq('id', user.id)
        .single();

      if (perfilError) {
        console.error('Erro ao buscar perfil:', perfilError);
        setNome('Usuário');
        return;
      }

      setNome(perfil?.nome || 'Usuário');
    } catch (erro) {
      console.error('Erro ao carregar nome do usuário:', erro);
      setNome('Usuário');
    }
  };
  
  // Obter dados dinâmicos
  const stats = calcularEstatisticas();
  const proximaAplicacao = getProximaAplicacao();
  const aplicacoesHoje = getAplicacoesHoje();
  const humorMedio = getHumorMedio();
  
  const getHumorTexto = (valor: number | null) => {
    if (!valor) return 'Não registrado';
    const textos = ['Ruim', 'Regular', 'Neutro', 'Bom', 'Ótimo'];
    return textos[valor - 1] || 'Não registrado';
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Início</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/pessoa-trans/(tabs-pessoatrans)/perfil')}
        >
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

        {/* Saudação */}
        <Text style={styles.greeting}>
          Olá, <Text style={styles.name}>{nome}</Text> 
        </Text>

        {/* Plano Hormonal - Card expandido com dados reais */}
        <Text style={styles.sectionTitle}>Plano Hormonal</Text>
        <TouchableOpacity 
          style={styles.planoCardExpanded}
          onPress={() => router.push('/pessoa-trans/plano-hormonal')}
        >
          <View style={styles.planoHeader}>
            <View style={styles.planoHeaderLeft}>
              <Ionicons name="medical" size={24} color={colors.primary} />
              <Text style={styles.planoTitle}>Meu Plano Hormonal</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </View>

          <View style={styles.planoStats}>
            <View style={styles.planoStatItem}>
              <Text style={styles.planoStatValue}>
                {HORMONIOS_MOCK.filter(h => h.ativo).length}
              </Text>
              <Text style={styles.planoStatLabel}>Hormônios ativos</Text>
            </View>
            <View style={styles.planoDivider} />
            <View style={styles.planoStatItem}>
              <Text style={styles.planoStatValue}>{aplicacoesHoje.length}</Text>
              <Text style={styles.planoStatLabel}>Aplicações hoje</Text>
            </View>
            <View style={styles.planoDivider} />
            <View style={styles.planoStatItem}>
              <Text style={styles.planoStatValue}>{stats.taxaAdesao}%</Text>
              <Text style={styles.planoStatLabel}>Taxa de adesão</Text>
            </View>
          </View>

          <View style={styles.planoFooter}>
            <Ionicons name="time-outline" size={14} color={colors.primary} />
            <Text style={styles.planoFooterText}>
              Próxima aplicação: {proximaAplicacao.diasRestantes === 0 ? 'Hoje' : `Em ${proximaAplicacao.diasRestantes} dias`} às {proximaAplicacao.horario}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Bem-estar com dados reais */}
        <Text style={styles.sectionTitle}>Bem-estar</Text>
        <View style={styles.card}>
          <Ionicons name="happy-outline" size={22} color={colors.primary} />
          <View>
            <Text style={styles.cardTitle}>Hoje</Text>
            <Text style={styles.cardSubtitle}>
              Humor: {getHumorTexto(humorMedio)}
            </Text>
          </View>
        </View>

        {/* Agendar psi e contatos medicos */}
        <Text style={styles.sectionTitle}>Ações</Text>

        <Button 
          title="Agendar Psicólogo" 
          onPress={() => router.push('/pessoa-trans/agendamento/agendar-psicologo')} 
        />

        <View style={{ marginTop: 5 }} />

        <Button 
          title="Contatos Médicos" 
          onPress={() => router.push('/pessoa-trans/contatos-medicos')} 
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
header: {
  height: 56,
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
},

headerTitle: {
  fontSize: 20,
  fontWeight: '600',
},

settingsButton: {
  position: 'absolute',
  right: 16,
},
  greeting: {
    fontFamily: fonts.bold,
    fontSize: 30,
    color: colors.text,
    marginTop: 10,
    marginBottom: 1,
  },
  name: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    marginTop: 20,
    marginBottom: 8,
    color: colors.text,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  link: {
    fontFamily: fonts.medium,
    color: colors.primary,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fffafb',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardRow: {
    gap: 10,
  },
  cardTitle: {
    fontFamily: fonts.medium,
    color: colors.text,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    color: colors.primary,
    fontSize: 13,
  },
  reminderButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  reminderText: {
    fontFamily: fonts.semibold,
    color: colors.white,
    fontSize: 13,
  },
  viewLink: {
  flexDirection: 'row',
  alignItems: 'baseline',
  gap:4,
},
planoCardExpanded: {
  backgroundColor: '#fffafb',
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
},
planoHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
},
planoHeaderLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},
planoTitle: {
  fontFamily: fonts.semibold,
  fontSize: 16,
  color: colors.text,
},
planoStats: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  paddingVertical: 12,
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderColor: '#F0F0F0',
  marginBottom: 12,
},
planoStatItem: {
  alignItems: 'center',
  flex: 1,
},
planoStatValue: {
  fontFamily: fonts.bold,
  fontSize: 20,
  color: colors.primary,
  marginBottom: 4,
},
planoStatLabel: {
  fontFamily: fonts.regular,
  fontSize: 11,
  color: colors.muted,
  textAlign: 'center',
},
planoDivider: {
  width: 1,
  backgroundColor: '#F0F0F0',
},
planoFooter: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},
planoFooterText: {
  fontFamily: fonts.regular,
  fontSize: 13,
  color: colors.primary,
},
});
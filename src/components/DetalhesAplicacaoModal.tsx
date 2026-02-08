import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

interface DetalhesAplicacaoModalProps {
  visible: boolean;
  onClose: () => void;
  aplicacao: {
    data_aplicacao: string;
    horario_previsto: string | null;
    horario_aplicado: string | null;
    status: string;
    atraso: number;
    local_aplicacao?: string | null;
    efeitos_colaterais?: string[] | null;
    humor?: number | null;
    observacoes?: string | null;
  } | null;
}

export default function DetalhesAplicacaoModal({
  visible,
  onClose,
  aplicacao,
}: DetalhesAplicacaoModalProps) {
  if (!aplicacao) return null;

    const formatarData = (dataStr: string) => {
    const [ano, mes, dia] = dataStr.split('-');
    const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    return data.toLocaleDateString('pt-BR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    };

  const getHumorEmoji = (valor: number) => {
    const humores = ['sad-outline', 'happy-outline', 'remove-circle-outline', 'happy-outline', 'happy-outline'];
    return humores[valor - 1] || 'help-outline';
  };

  const getStatusColor = (status: string) => {
    return status === 'aplicado' ? '#4CAF50' : '#FF9800';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Detalhes da Aplicação</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Data */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data</Text>
              <Text style={styles.sectionValue}>{formatarData(aplicacao.data_aplicacao)}</Text>
            </View>

            {/* Horários */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Horário</Text>
              <View style={styles.horarioRow}>
                <View style={styles.horarioItem}>
                  <Text style={styles.horarioLabel}>Previsto</Text>
                  <Text style={styles.horarioValue}>{aplicacao.horario_previsto || '--:--'}</Text>
                </View>
                <View style={styles.horarioItem}>
                  <Text style={styles.horarioLabel}>Aplicado</Text>
                  <Text style={[styles.horarioValue, { color: getStatusColor(aplicacao.status) }]}>
                    {aplicacao.horario_aplicado || '--:--'}
                  </Text>
                </View>
              </View>
              {aplicacao.atraso > 0 && (
                <Text style={styles.atrasoText}>Atraso de {aplicacao.atraso} minutos</Text>
              )}
            </View>

            {/* Local de Aplicação */}
            {aplicacao.local_aplicacao && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Local de Aplicação</Text>
                <Text style={styles.sectionValue}>{aplicacao.local_aplicacao}</Text>
              </View>
            )}

            {/* Humor */}
            {aplicacao.humor && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Humor</Text>
                <View style={styles.humorContainer}>
                  <Ionicons
                    name={getHumorEmoji(aplicacao.humor) as any}
                    size={32}
                    color={colors.primary}
                  />
                </View>
              </View>
            )}

            {/* Efeitos Colaterais */}
            {aplicacao.efeitos_colaterais && aplicacao.efeitos_colaterais.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Efeitos Colaterais</Text>
                {aplicacao.efeitos_colaterais.map((efeito, index) => (
                  <View key={index} style={styles.efeitoItem}>
                    <Ionicons name="alert-circle-outline" size={16} color={colors.primary} />
                    <Text style={styles.efeitoText}>{efeito}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Observações */}
            {aplicacao.observacoes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Observações</Text>
                <Text style={styles.observacoesText}>{aplicacao.observacoes}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.muted,
    marginBottom: 8,
  },
  sectionValue: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  horarioRow: {
    flexDirection: 'row',
    gap: 24,
  },
  horarioItem: {
    flex: 1,
  },
  horarioLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 4,
  },
  horarioValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  atrasoText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#FF9800',
    marginTop: 8,
  },
  humorContainer: {
    alignItems: 'flex-start',
  },
  efeitoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  efeitoText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  observacoesText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
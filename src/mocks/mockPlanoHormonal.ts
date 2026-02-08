export const HORMONIOS_MOCK = [
  {
    id: '1',
    nome: 'Testosterona',
    dosagem: '20',
    unidadeDosagem: 'mg',
    frequencia: 'Semanal',
    modoAplicacao: 'Injetável',
    horarioPreferencial: '08:00',
    diasSemana: [2, 5], // segunda e quinta? Não tenho uma ideia melhor
    localAplicacao: 'Coxa direita',
    observacoesMedicas: 'Aplicar em jejum para melhor absorção. Manter local da aplicação alternado.',
    medico: 'Dra. Ygona Moura',
    ativo: true,
    dataInicio: '2025-01-01',
  },
  {
    id: '2',
    nome: 'Finasterida',
    dosagem: '1',
    unidadeDosagem: 'mg',
    frequencia: 'Diária',
    modoAplicacao: 'Oral',
    horarioPreferencial: '22:00',
    diasSemana: [],
    localAplicacao: '',
    observacoesMedicas: 'Tomar com água após a refeição.',
    ativo: true,
    medico: 'Dra. Aghata Nunes',
    dataInicio: '2025-01-01',
  },
];

export const APLICACOES_MOCK = [
  // Janeiro 2026
  { 
    id: '1',
    hormonioId: '1',
    data: '2026-01-29', 
    horarioPrevisto: '08:00',
    horarioAplicado: '08:00',
    status: 'aplicado',
    atraso: 0,
    localAplicacao: 'Coxa direita',
    humor: 4,
    efeitosColaterais: [],
    observacoes: '',
  },
  { 
    id: '2',
    hormonioId: '2',
    data: '2026-01-29', 
    horarioPrevisto: '22:00',
    horarioAplicado: '22:00',
    status: 'aplicado',
    atraso: 0,
    humor: 4,
    efeitosColaterais: [],
    observacoes: '',
  },
  { 
    id: '3',
    hormonioId: '1',
    data: '2026-01-22', 
    horarioPrevisto: '08:00',
    horarioAplicado: '09:45',
    status: 'atrasado',
    atraso: 105,
    localAplicacao: 'Coxa esquerda',
    humor: 3,
    efeitosColaterais: ['Dor local'],
    observacoes: 'Acordei tarde hoje',
  },
  { 
    id: '4',
    hormonioId: '2',
    data: '2026-01-22', 
    horarioPrevisto: '22:00',
    horarioAplicado: '22:10',
    status: 'atrasado',
    atraso: 10,
    humor: 3,
    efeitosColaterais: [],
    observacoes: '',
  },
  // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
];

// Função para calcular estatísticas
export const calcularEstatisticas = () => {
  const aplicadas = APLICACOES_MOCK.filter(a => a.status === 'aplicado' || a.status === 'atrasado');
  const noHorario = APLICACOES_MOCK.filter(a => a.status === 'aplicado' && a.atraso === 0).length;
  const atrasadas = APLICACOES_MOCK.filter(a => a.status === 'atrasado').length;
  
  const totalAtrasos = APLICACOES_MOCK
    .filter(a => a.atraso > 0)
    .reduce((sum, a) => sum + a.atraso, 0);
  const atrasoMedio = atrasadas > 0 ? Math.round(totalAtrasos / atrasadas) : 0;
  
  const taxaAdesao = aplicadas.length > 0 
    ? Math.round((noHorario / aplicadas.length) * 100) 
    : 100;

  return {
    taxaAdesao,
    noHorario,
    atrasadas,
    atrasoMedio,
    totalAplicacoes: aplicadas.length,
  };
};

// Função para obter próxima aplicação
export const getProximaAplicacao = () => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  // Mock: próxima aplicação em 3 dias
  const proxima = new Date(hoje);
  proxima.setDate(proxima.getDate() + 3);
  
  return {
    data: proxima.toISOString().split('T')[0],
    diasRestantes: 3,
    horario: '08:00',
    hormonio: 'Testosterona',
  };
};

// Função para obter aplicações de hoje
export const getAplicacoesHoje = () => {
  const hoje = new Date().toISOString().split('T')[0];
  return APLICACOES_MOCK.filter(a => a.data === hoje);
};

// Função para calcular humor médio
export const getHumorMedio = () => {
  const comHumor = APLICACOES_MOCK.filter(a => a.humor);
  if (comHumor.length === 0) return null;
  
  const soma = comHumor.reduce((sum, a) => sum + (a.humor || 0), 0);
  return Math.round(soma / comHumor.length);
};

// Mock de dados de evolução (níveis hormonais ao longo do tempo)
export const EVOLUCAO_MOCK = {
  testosterona: {
    nivelAtual: '550 ng/dL',
    percentualMudanca: '+15%',
    dados: [450, 480, 510, 520, 535, 550],
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  },
  estradiol: {
    nivelAtual: '180 pg/mL',
    percentualMudanca: '+22%',
    dados: [125, 140, 155, 165, 172, 180],
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  },
};

// Mock de estatísticas detalhadas
export const ESTATISTICAS_DETALHADAS = {
  geral: {
    taxaAdesao: 94,
    noHorario: 12,
    atrasadas: 1,
    perdidas: 0,
    atrasoMedio: 15,
    aplicacoesUltimos30Dias: [
      { dia: 1, quantidade: 2 },
      { dia: 5, quantidade: 2 },
      { dia: 8, quantidade: 2 },
      { dia: 12, quantidade: 2 },
      { dia: 15, quantidade: 2 },
      { dia: 19, quantidade: 1 }, // atrasada
      { dia: 22, quantidade: 2 },
      { dia: 26, quantidade: 2 },
      { dia: 29, quantidade: 2 },
    ],
  },
  porHormonio: {
    '1': { // Testosterona
      taxaAdesao: 94,
      aplicacoesNoHorario: 28,
      aplicacoesAtrasadas: 2,
      aplicacoesPerdidas: 0,
      atrasoMedio: 23,
      humorMedio: 4.2,
      efeitosColaterais: [
        { nome: 'Dor de cabeça', ocorrencias: 8 },
        { nome: 'Náusea', ocorrencias: 3 },
        { nome: 'Tontura', ocorrencias: 1 },
      ],
    },
    '2': { // Finasterida
      taxaAdesao: 95,
      aplicacoesNoHorario: 29,
      aplicacoesAtrasadas: 1,
      aplicacoesPerdidas: 0,
      atrasoMedio: 10,
      humorMedio: 4.0,
      efeitosColaterais: [
        { nome: 'Náusea', ocorrencias: 2 },
      ],
    },
  },
  tendencias: {
    adesaoMensal: [
      { mes: 'Jan', taxa: 88 },
      { mes: 'Fev', taxa: 90 },
      { mes: 'Mar', taxa: 92 },
      { mes: 'Abr', taxa: 93 },
      { mes: 'Mai', taxa: 94 },
      { mes: 'Jun', taxa: 94 },
    ],
    padroes: {
      melhorPeriodo: 'Manhãs',
      melhorPeriodoTaxa: 95,
      piorPeriodo: 'Noites',
      piorPeriodoTaxa: 70,
      melhorDia: 'Terça-feira',
      melhorDiaTaxa: 98,
      piorDia: 'Domingo',
      piorDiaTaxa: 85,
    },
    insights: [
      'Considere configurar um segundo lembrete para doses noturnas',
      'Sua adesão melhorou 12% no último mês. Continue assim! 🎉',
      'Você tem sido consistente com rotação de locais de aplicação',
    ],
  },
};
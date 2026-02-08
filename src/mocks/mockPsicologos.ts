export interface Psicologo {
  id: string;
  nome: string;
  especialidade: string;
  tipo: string;
  crp: string;
  foto: string;
}

export const PSICOLOGOS_MOCK: { [key: string]: Psicologo } = {
  '1': {
    id: '1',
    nome: 'Dr. Davi Britto',
    especialidade: 'Especialista em apoio durante transição de gênero',
    tipo: 'Sessões online via aplicativo',
    crp: 'CRP-SP 01234567',
    foto: 'https://i.pravatar.cc/150?img=7',
  },
  '2': {
    id: '2',
    nome: 'Dra. Tyla Silva',
    especialidade: 'Especialista em identidade de gênero',
    tipo: 'Sessões online via aplicativo e presenciais',
    crp: 'CRP-SP 01234568',
    foto: 'https://i.pravatar.cc/150?img=5',
  },
  '3': {
    id: '3',
    nome: 'Dra. Choo Doloona',
    especialidade: 'Foco em terapia hormonal e saúde mental',
    tipo: 'Sessões online via aplicativo',
    crp: 'CRP-SP 01234569',
    foto: 'https://i.pravatar.cc/150?img=9',
  },
};

// Mock de datas disponíveis por psicólogo (formato YYYY-MM-DD)
export const DATAS_DISPONIVEIS_MOCK: { [key: string]: string[] } = {
  '1': [
    // Fevereiro 2026
    '2026-02-03', '2026-02-05', '2026-02-10', '2026-02-12', 
    '2026-02-17', '2026-02-19', '2026-02-24', '2026-02-26',
    // Março 2026
    '2026-03-03', '2026-03-05', '2026-03-10', '2026-03-12',
    '2026-03-17', '2026-03-19', '2026-03-24', '2026-03-26', '2026-03-31',
    // Abril 2026
    '2026-04-02', '2026-04-07', '2026-04-09', '2026-04-14',
    '2026-04-16', '2026-04-21', '2026-04-23', '2026-04-28', '2026-04-30',
  ],
  '2': [
    // Fevereiro 2026
    '2026-02-02', '2026-02-04', '2026-02-09', '2026-02-11',
    '2026-02-16', '2026-02-18', '2026-02-23', '2026-02-25',
    // Março 2026
    '2026-03-02', '2026-03-04', '2026-03-09', '2026-03-11',
    '2026-03-16', '2026-03-18', '2026-03-23', '2026-03-25', '2026-03-30',
    // Abril 2026
    '2026-04-01', '2026-04-06', '2026-04-08', '2026-04-13',
    '2026-04-15', '2026-04-20', '2026-04-22', '2026-04-27', '2026-04-29',
  ],
  '3': [
    // Fevereiro 2026
    '2026-02-06', '2026-02-13', '2026-02-20', '2026-02-27',
    // Março 2026
    '2026-03-06', '2026-03-13', '2026-03-20', '2026-03-27',
    // Abril 2026
    '2026-04-03', '2026-04-10', '2026-04-17', '2026-04-24',
  ],
};

// Helper: Pegar "meu psicólogo" (ID 1)
export const getMeuPsicologo = () => PSICOLOGOS_MOCK['1'];

// Helper: Pegar outros psicólogos (exceto ID 1)
export const getOutrosPsicologos = () => {
  return Object.values(PSICOLOGOS_MOCK).filter(p => p.id !== '1');
};

// Helper: Pegar psicólogo por ID
export const getPsicologoById = (id: string) => {
  return PSICOLOGOS_MOCK[id] || PSICOLOGOS_MOCK['1'];
};

// Helper: Pegar datas disponíveis por psicólogo
export const getDatasDisponiveisByPsicologo = (id: string) => {
  return DATAS_DISPONIVEIS_MOCK[id] || [];
};
export interface Consulta {
  id: string;
  psicologoId: string;
  psicologoNome: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM
  status: 'agendada' | 'confirmada' | 'realizada' | 'cancelada';
  statusLabel?: string;
  tipo: 'online' | 'presencial';
  link?: string; // Link da videochamada
  observacoes?: string;
}

export const CONSULTAS_MOCK: Consulta[] = [
  {
    id: '1',
    psicologoId: '1',
    psicologoNome: 'Dr. Davi Britto',
    data: '2026-02-15',
    horario: '14:00',
    status: 'agendada',
    tipo: 'online',
    link: 'https://meet.transcend.com/abc123',
  },
  {
    id: '2',
    psicologoId: '1',
    psicologoNome: 'Dr. Davi Britto',
    data: '2026-02-08',
    horario: '14:00',
    status: 'realizada',
    tipo: 'online',
    observacoes: 'Sessão produtiva, discutimos sobre ansiedade.',
  },
  {
    id: '3',
    psicologoId: '2',
    psicologoNome: 'Dra. Tyla Silva',
    data: '2026-01-25',
    horario: '10:00',
    status: 'realizada',
    tipo: 'online',
  },
];

// Helper: Pegar próxima consulta
export const getProximaConsulta = () => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const futuras = CONSULTAS_MOCK
    .filter(c => c.status === 'agendada')
    .filter(c => new Date(c.data) >= hoje)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  
  return futuras[0] || null;
};

// Helper: Pegar consultas agendadas
export const getConsultasAgendadas = () => {
  return CONSULTAS_MOCK.filter(c => c.status === 'agendada');
};

// Helper: Pegar consultas realizadas
export const getConsultasRealizadas = () => {
  return CONSULTAS_MOCK.filter(c => c.status === 'realizada');
};

// Helper: Formatar data para exibição
export const formatarData = (dataStr: string) => {
  const data = new Date(dataStr + 'T00:00:00');
  return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
};

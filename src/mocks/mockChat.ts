export interface Mensagem {
  id: string;
  remetenteId: string;
  remetenteTipo: 'paciente' | 'psicologo' | 'sistema';
  conteudo: string;
  timestamp: string; // ISO string
  lida: boolean;
  tipo: 'texto' | 'imagem' | 'documento';
}

export interface Conversa {
  id: string;
  psicologoId: string;
  psicologoNome: string;
  psicologoFoto: string;
  ultimaMensagem: string;
  timestampUltimaMensagem: string;
  naoLidas: number;
  ativa: boolean;
}

export const MENSAGENS_MOCK: { [conversaId: string]: Mensagem[] } = {
  '1': [
    {
      id: '1',
      remetenteId: 'sistema',
      remetenteTipo: 'sistema',
      conteudo: '🤖 Lembrete: Pagamentos e agendamentos são combinados diretamente com seu psicólogo. O Transcend não processa pagamentos.',
      timestamp: '2026-02-01T10:00:00',
      lida: true,
      tipo: 'texto',
    },
    {
      id: '2',
      remetenteId: '1',
      remetenteTipo: 'psicologo',
      conteudo: 'Olá! Tudo bem? Estou pronta para nossa primeira sessão.',
      timestamp: '2026-02-01T10:05:00',
      lida: true,
      tipo: 'texto',
    },
    {
      id: '3',
      remetenteId: 'paciente',
      remetenteTipo: 'paciente',
      conteudo: 'Oi! Tudo ótimo, obrigado. Como funciona o pagamento?',
      timestamp: '2026-02-01T10:07:00',
      lida: true,
      tipo: 'texto',
    },
    {
      id: '4',
      remetenteId: '1',
      remetenteTipo: 'psicologo',
      conteudo: 'A consulta custa R$ 45,00. Você pode fazer PIX para a chave: psicologa@email.com',
      timestamp: '2026-02-01T10:10:00',
      lida: true,
      tipo: 'texto',
    },
    {
      id: '5',
      remetenteId: 'paciente',
      remetenteTipo: 'paciente',
      conteudo: 'Perfeito! Acabei de enviar. Vou mandar o comprovante em breve.',
      timestamp: '2026-02-01T10:15:00',
      lida: true,
      tipo: 'texto',
    },
    {
      id: '6',
      remetenteId: '1',
      remetenteTipo: 'psicologo',
      conteudo: 'Ótimo! Assim que confirmar o pagamento, te envio o link da consulta.',
      timestamp: '2026-02-07T14:30:00',
      lida: false,
      tipo: 'texto',
    },
  ],
  '2': [
    {
      id: '7',
      remetenteId: 'sistema',
      remetenteTipo: 'sistema',
      conteudo: '🤖 Lembrete: Pagamentos e agendamentos são combinados diretamente com seu psicólogo. O Transcend não processa pagamentos.',
      timestamp: '2026-01-20T09:00:00',
      lida: true,
      tipo: 'texto',
    },
    {
      id: '8',
      remetenteId: '2',
      remetenteTipo: 'psicologo',
      conteudo: 'Olá! Vamos iniciar a consulta?',
      timestamp: '2026-02-06T16:00:00',
      lida: false,
      tipo: 'texto',
    },
  ],
};

export const CONVERSAS_MOCK: Conversa[] = [
  {
    id: '1',
    psicologoId: '1',
    psicologoNome: 'Dr. Davi Britto',
    psicologoFoto: 'https://i.pravatar.cc/150?img=7',
    ultimaMensagem: 'Ótimo! Assim que confirmar o pagamento, te envio o link da consulta.',
    timestampUltimaMensagem: '2026-02-07T14:30:00',
    naoLidas: 1,
    ativa: true,
  },
  {
    id: '2',
    psicologoId: '2',
    psicologoNome: 'Dra. Tyla Silva',
    psicologoFoto: 'https://i.pravatar.cc/150?img=5',
    ultimaMensagem: 'Olá! Podemos começar a consulta?',
    timestampUltimaMensagem: '2026-02-06T16:00:00',
    naoLidas: 1,
    ativa: true,
  },
];

// Helper: Formatar timestamp para exibição
export const formatarTimestamp = (timestamp: string) => {
  const data = new Date(timestamp);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);

  // Resetar horas para comparação de data
  hoje.setHours(0, 0, 0, 0);
  ontem.setHours(0, 0, 0, 0);
  const dataMsg = new Date(data);
  dataMsg.setHours(0, 0, 0, 0);

  if (dataMsg.getTime() === hoje.getTime()) {
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } else if (dataMsg.getTime() === ontem.getTime()) {
    return 'Ontem';
  } else {
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
};

// Helper: Formatar hora da mensagem
export const formatarHoraMensagem = (timestamp: string) => {
  const data = new Date(timestamp);
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};
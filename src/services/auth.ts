// Mock de serviço de autenticação
// Quando o Supabase estiver pronto, substitua essas funções pelas chamadas reais

interface ResultadoLogin {
  sucesso: boolean;
  usuario?: {
    id: string;
    nome: string;
    email: string;
  };
  erro?: string;
}

interface ResultadoCadastro {
  sucesso: boolean;
  erro?: string;
}

// Simula delay de rede (como uma chamada real de API)
const simularDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock de usuários cadastrados (apenas para desenvolvimento)
const usuariosMock = [
  {
    id: '1',
    nome: 'Usuário Teste',
    email: 'teste@email.com',
    senha: '123456',
  },
];

/**
 * Simula login de usuário
 * Credenciais para teste: teste@email.com / 123456
 */
export const fazerLogin = async (
  email: string,
  senha: string
): Promise<ResultadoLogin> => {
  await simularDelay(800);

  const usuario = usuariosMock.find(
    (u) => u.email === email && u.senha === senha
  );

  if (usuario) {
    return {
      sucesso: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    };
  }

  return {
    sucesso: false,
    erro: 'Email ou senha incorretos',
  };
};

/**
 * Simula cadastro de novo usuário
 */
export const fazerCadastro = async (
  nome: string,
  email: string,
  senha: string
): Promise<ResultadoCadastro> => {
  await simularDelay(1000);

  // Valida se email já existe
  const emailExiste = usuariosMock.some((u) => u.email === email);

  if (emailExiste) {
    return {
      sucesso: false,
      erro: 'Este email já está cadastrado',
    };
  }

  // Simula cadastro bem-sucedido
  // Em produção, aqui seria a chamada ao Supabase
  usuariosMock.push({
    id: String(usuariosMock.length + 1),
    nome,
    email,
    senha,
  });

  return {
    sucesso: true,
  };
};

/**
 * Função para quando integrar com Supabase (comentada para referência)
 */
/*
import { supabase } from '../config/supabase';

export const fazerLoginSupabase = async (email: string, senha: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  return {
    sucesso: true,
    usuario: {
      id: data.user?.id,
      email: data.user?.email,
      nome: data.user?.user_metadata?.nome,
    },
  };
};
*/
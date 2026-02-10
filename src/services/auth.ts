import { supabase } from '@/utils/supabase';
import {
  Usuario,
  Perfil,
  Psicologo,
  DadosCadastroTrans,
  DadosCadastroPsicologo,
  ResultadoAuth,
  Sessao,
  TipoUsuario,
  Genero,
  ConfiguracoesPrivacidade,
} from '../types/auth';

/**
 * Mapeia erros do Supabase para mensagens em português
 */
const mapearErro = (codigo: string, mensagemOriginal: string): string => {
  const erros: Record<string, string> = {
    'invalid_credentials': 'Email ou senha incorretos. Verifique seus dados e tente novamente.',
    'email_not_confirmed': 'Seu email ainda não foi confirmado. Verifique sua caixa de entrada e clique no link de confirmação.',
    'user_already_exists': 'Este email já está cadastrado. Tente fazer login ou use outro email.',
    'weak_password': 'A senha é muito fraca. Use pelo menos 6 caracteres, combinando letras e números.',
    'invalid_email': 'O email informado não é válido. Verifique se digitou corretamente (ex: nome@email.com).',
    'over_email_send_rate_limit': 'Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente.',
    'user_not_found': 'Nenhuma conta encontrada com este email. Verifique o email ou crie uma nova conta.',
  };

  return erros[codigo] || mensagemOriginal || 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.';
};

/**
 * Aguarda um tempo especificado (para dar tempo ao trigger)
 */
const aguardar = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Cria ou atualiza o perfil do usuário
 * Tenta primeiro verificar se o perfil existe (criado pelo trigger),
 * se não existir, cria manualmente. Se existir, atualiza.
 */
const criarOuAtualizarPerfil = async (
  userId: string,
  email: string,
  dados: {
    nome: string;
    tipo: TipoUsuario;
    data_nascimento?: string | null;
    genero: Genero;
  }
): Promise<{ perfil: Perfil | null; erro: string | null }> => {
  // Aguarda um pouco para dar tempo ao trigger (se existir)
  await aguardar(500);

  // Verificar se o perfil já existe (criado pelo trigger)
  const { data: perfilExistente, error: selectError } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', userId)
    .single();

  if (perfilExistente && !selectError) {
    // Perfil existe, atualizar com dados adicionais
    console.log('Perfil encontrado (trigger funcionou), atualizando dados adicionais...');

    const { data: perfilAtualizado, error: updateError } = await supabase
      .from('perfis')
      .update({
        nome: dados.nome,
        data_nascimento: dados.data_nascimento || null,
        genero: dados.genero,
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError);
      return { perfil: perfilExistente as Perfil, erro: null }; // Retorna o existente mesmo assim
    }

    return { perfil: perfilAtualizado as Perfil, erro: null };
  }

  // Perfil não existe, criar manualmente (trigger não funcionou)
  console.log('Perfil não encontrado, criando manualmente...');

  const { data: novoPerfil, error: insertError } = await supabase
    .from('perfis')
    .insert({
      id: userId,
      email: email,
      tipo: dados.tipo,
      nome: dados.nome,
      data_nascimento: dados.data_nascimento || null,
      genero: dados.genero,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Erro ao criar perfil:', insertError);
    return { perfil: null, erro: `Erro ao criar perfil: ${insertError.message}` };
  }

  console.log('Perfil criado com sucesso:', novoPerfil);
  return { perfil: novoPerfil as Perfil, erro: null };
};

/**
 * Cria a entrada na tabela psicologos
 */
const criarPsicologo = async (
  usuarioId: string,
  dados: {
    crp: string;
    especialidades?: string[] | null;
    abordagem?: string | null;
    valor_consulta?: number | null;
    atende_online?: boolean;
    atende_presencial?: boolean;
  }
): Promise<{ psicologo: Psicologo | null; erro: string | null }> => {
  // Verificar se já existe
  const { data: existente } = await supabase
    .from('psicologos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .single();

  if (existente) {
    console.log('Psicólogo já existe, retornando existente');
    return { psicologo: existente as Psicologo, erro: null };
  }

  const { data: psicologo, error } = await supabase
    .from('psicologos')
    .insert({
      usuario_id: usuarioId,
      crp: dados.crp,
      especialidades: dados.especialidades || null,
      abordagem: dados.abordagem || null,
      valor_consulta: dados.valor_consulta || null,
      atende_online: dados.atende_online ?? true,
      atende_presencial: dados.atende_presencial ?? false,
      aceita_convenio: false,
      verificado: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar psicólogo:', error);
    return { psicologo: null, erro: `Erro ao criar dados do psicólogo: ${error.message}` };
  }

  console.log('Psicólogo criado com sucesso:', psicologo);
  return { psicologo: psicologo as Psicologo, erro: null };
};

/**
 * Busca o perfil completo do usuário
 */
const buscarPerfil = async (userId: string): Promise<Usuario | null> => {
  // Buscar perfil na tabela perfis
  const { data: perfil, error: perfilError } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', userId)
    .is('deleted_at', null)
    .single();

  if (perfilError || !perfil) {
    console.error('Erro ao buscar perfil:', perfilError);
    return null;
  }

  const usuario: Usuario = perfil as Perfil;

  // Se for psicólogo, buscar dados adicionais
  if (perfil.tipo === 'psicologo') {
    const { data: psicologo, error: psiError } = await supabase
      .from('psicologos')
      .select('*')
      .eq('usuario_id', userId)
      .single();

    if (!psiError && psicologo) {
      usuario.psicologo = psicologo as Psicologo;
    }
  }

  return usuario;
};

/**
 * Realiza login do usuário
 */
export const fazerLogin = async (
  email: string,
  senha: string
): Promise<ResultadoAuth<Usuario>> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      return {
        sucesso: false,
        erro: mapearErro(error.code || '', error.message),
        codigo: error.code,
      };
    }

    if (!data.user) {
      return {
        sucesso: false,
        erro: 'Não foi possível obter os dados do usuário. Tente fazer login novamente.',
      };
    }

    const perfil = await buscarPerfil(data.user.id);

    if (!perfil) {
      return {
        sucesso: false,
        erro: 'Seu perfil não foi encontrado. Entre em contato com o suporte se o problema persistir.',
      };
    }

    // Psicólogo precisa estar verificado para acessar o app
    if (perfil.tipo === 'psicologo' && !perfil.psicologo?.verificado) {
      await supabase.auth.signOut();
      return {
        sucesso: false,
        erro: 'Seu cadastro ainda está em análise. Você será notificado quando sua conta for aprovada.',
      };
    }

    return {
      sucesso: true,
      dados: perfil,
    };
  } catch (erro) {
    console.error('Erro no login:', erro);
    return {
      sucesso: false,
      erro: 'Ocorreu um erro inesperado ao fazer login. Verifique sua conexão e tente novamente.',
    };
  }
};

/**
 * Cadastra pessoa trans
 * Cria o usuário no Auth e o perfil na tabela perfis.
 * Funciona independente do trigger handle_new_user().
 */
export const cadastrarTrans = async (
  dados: DadosCadastroTrans
): Promise<ResultadoAuth<Usuario>> => {
  try {
    console.log('Iniciando cadastro trans:', dados.email);

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: dados.email,
      password: dados.senha,
      options: {
        data: {
          nome: dados.nome,
          tipo: 'pessoa_trans' as TipoUsuario,
        },
      },
    });

    if (authError) {
      console.error('Erro no auth.signUp:', authError);
      return {
        sucesso: false,
        erro: mapearErro(authError.code || '', authError.message),
        codigo: authError.code,
      };
    }

    if (!authData.user) {
      return {
        sucesso: false,
        erro: 'Não foi possível criar sua conta. Tente novamente em alguns instantes.',
      };
    }

    console.log('Usuário auth criado:', authData.user.id);

    // 2. Criar ou atualizar perfil (funciona com ou sem trigger)
    const { perfil, erro: erroPerfil } = await criarOuAtualizarPerfil(
      authData.user.id,
      dados.email,
      {
        nome: dados.nome,
        tipo: 'pessoa_trans',
        data_nascimento: dados.data_nascimento,
        genero: dados.genero,
      }
    );

    if (erroPerfil || !perfil) {
      return {
        sucesso: false,
        erro: erroPerfil || 'Erro ao criar perfil',
      };
    }

    return {
      sucesso: true,
      dados: perfil as Usuario,
    };
  } catch (erro) {
    console.error('Erro no cadastro trans:', erro);
    return {
      sucesso: false,
      erro: 'Ocorreu um erro inesperado ao realizar o cadastro. Verifique sua conexão e tente novamente.',
    };
  }
};

/**
 * Cadastra psicólogo
 * Cria o usuário no Auth, o perfil na tabela perfis e os dados na tabela psicologos.
 * Funciona independente do trigger handle_new_user().
 */
export const cadastrarPsicologo = async (
  dados: DadosCadastroPsicologo
): Promise<ResultadoAuth<Usuario>> => {
  try {
    console.log('Iniciando cadastro psicólogo:', dados.email);

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: dados.email,
      password: dados.senha,
      options: {
        data: {
          nome: dados.nome,
          tipo: 'psicologo' as TipoUsuario,
        },
      },
    });

    if (authError) {
      console.error('Erro no auth.signUp:', authError);
      return {
        sucesso: false,
        erro: mapearErro(authError.code || '', authError.message),
        codigo: authError.code,
      };
    }

    if (!authData.user) {
      return {
        sucesso: false,
        erro: 'Não foi possível criar sua conta. Tente novamente em alguns instantes.',
      };
    }

    console.log('Usuário auth criado:', authData.user.id);

    // 2. Criar ou atualizar perfil (funciona com ou sem trigger)
    const { perfil, erro: erroPerfil } = await criarOuAtualizarPerfil(
      authData.user.id,
      dados.email,
      {
        nome: dados.nome,
        tipo: 'psicologo',
        data_nascimento: dados.data_nascimento,
        genero: dados.genero || 'outro',
      }
    );

    if (erroPerfil || !perfil) {
      return {
        sucesso: false,
        erro: erroPerfil || 'Erro ao criar perfil',
      };
    }

    // 3. Criar entrada na tabela psicologos
    const { psicologo, erro: erroPsicologo } = await criarPsicologo(
      authData.user.id,
      {
        crp: dados.crp,
        especialidades: dados.especialidades,
        abordagem: dados.abordagem,
        valor_consulta: dados.valor_consulta,
        atende_online: dados.atende_online,
        atende_presencial: dados.atende_presencial,
      }
    );

    if (erroPsicologo || !psicologo) {
      // Perfil foi criado mas psicólogo não - ainda retorna sucesso parcial
      console.error('Aviso: Perfil criado mas dados de psicólogo falharam');
      return {
        sucesso: false,
        erro: erroPsicologo || 'Erro ao criar dados do psicólogo',
      };
    }

    const usuario: Usuario = {
      ...perfil,
      psicologo: psicologo,
    };

    return {
      sucesso: true,
      dados: usuario,
    };
  } catch (erro) {
    console.error('Erro no cadastro psicólogo:', erro);
    return {
      sucesso: false,
      erro: 'Ocorreu um erro inesperado ao realizar o cadastro. Verifique sua conexão e tente novamente.',
    };
  }
};

/**
 * Realiza logout do usuário
 */
export const fazerLogout = async (): Promise<ResultadoAuth<void>> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        sucesso: false,
        erro: 'Não foi possível fazer logout. Tente novamente.',
      };
    }

    return { sucesso: true };
  } catch (erro) {
    console.error('Erro no logout:', erro);
    return {
      sucesso: false,
      erro: 'Ocorreu um erro inesperado ao fazer logout. Tente novamente.',
    };
  }
};

/**
 * Envia email para recuperação de senha
 */
export const recuperarSenha = async (email: string): Promise<ResultadoAuth<void>> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'transcend://reset-password',
    });

    if (error) {
      return {
        sucesso: false,
        erro: mapearErro(error.code || '', error.message),
        codigo: error.code,
      };
    }

    return { sucesso: true };
  } catch (erro) {
    console.error('Erro na recuperação de senha:', erro);
    return {
      sucesso: false,
      erro: 'Ocorreu um erro inesperado ao enviar o email de recuperação. Verifique sua conexão e tente novamente.',
    };
  }
};

/**
 * Atualiza a senha do usuário
 */
export const atualizarSenha = async (novaSenha: string): Promise<ResultadoAuth<void>> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
    });

    if (error) {
      return {
        sucesso: false,
        erro: mapearErro(error.code || '', error.message),
        codigo: error.code,
      };
    }

    return { sucesso: true };
  } catch (erro) {
    console.error('Erro ao atualizar senha:', erro);
    return {
      sucesso: false,
      erro: 'Ocorreu um erro inesperado ao atualizar a senha. Verifique sua conexão e tente novamente.',
    };
  }
};

/**
 * Obtém a sessão atual do usuário
 */
export const obterSessao = async (): Promise<Sessao | null> => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      return null;
    }

    const perfil = await buscarPerfil(data.session.user.id);

    if (!perfil) {
      return null;
    }

    return {
      usuario: perfil,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at || 0,
    };
  } catch (erro) {
    console.error('Erro ao obter sessão:', erro);
    return null;
  }
};

/**
 * Obtém o usuário atual (se autenticado)
 */
export const obterUsuarioAtual = async (): Promise<Usuario | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return await buscarPerfil(data.user.id);
  } catch (erro) {
    console.error('Erro ao obter usuário:', erro);
    return null;
  }
};

/**
 * Listener para mudanças no estado de autenticação
 */
export const escutarMudancasAuth = (
  callback: (usuario: Usuario | null) => void
) => {
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      callback(null);
      return;
    }

    if (session.user) {
      const perfil = await buscarPerfil(session.user.id);
      callback(perfil);
    }
  });

  return data.subscription;
};

/**
 * Atualiza o perfil do usuário
 */
export const atualizarPerfil = async (
  userId: string,
  dados: Partial<Perfil>
): Promise<ResultadoAuth<Perfil>> => {
  try {
    // Remove campos que não devem ser atualizados diretamente
    const { id, created_at, updated_at, deleted_at, tipo, email, ...dadosAtualizaveis } = dados;

    const { data, error } = await supabase
      .from('perfis')
      .update(dadosAtualizaveis)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return {
        sucesso: false,
        erro: `Erro ao atualizar perfil: ${error.message}`,
      };
    }

    return {
      sucesso: true,
      dados: data as Perfil,
    };
  } catch (erro) {
    console.error('Erro ao atualizar perfil:', erro);
    return {
      sucesso: false,
      erro: 'Ocorreu um erro inesperado ao atualizar o perfil. Verifique sua conexão e tente novamente.',
    };
  }
};

/**
 * Faz upload de foto de perfil para o storage
 */
export const uploadFotoPerfil = async (
  userId: string,
  arquivo: { uri: string; name: string; type: string }
): Promise<ResultadoAuth<string>> => {
  try {
    const extensao = arquivo.name.split('.').pop();
    const nomeArquivo = `${userId}/avatar_${Date.now()}.${extensao}`;

    // Converter URI para blob
    const response = await fetch(arquivo.uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(nomeArquivo, blob, {
        contentType: arquivo.type,
        upsert: true,
      });

    if (error) {
      console.error('Erro no upload:', error);
      return {
        sucesso: false,
        erro: 'Não foi possível enviar a foto. Verifique se o arquivo é uma imagem válida e tente novamente.',
      };
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    // Atualizar foto_url no perfil
    await supabase
      .from('perfis')
      .update({ foto_url: urlData.publicUrl })
      .eq('id', userId);

    return {
      sucesso: true,
      dados: urlData.publicUrl,
    };
  } catch (erro) {
    console.error('Erro no upload:', erro);
    return {
      sucesso: false,
      erro: 'Não foi possível enviar a foto. Verifique se o arquivo é uma imagem válida e tente novamente.',
    };
  }
};

/**
 * Busca as configurações de privacidade do usuário
 */
export const buscarConfiguracoes = async (
  usuarioId: string
): Promise<ResultadoAuth<ConfiguracoesPrivacidade>> => {
  try {
    const { data, error } = await supabase
      .from('configuracoes_privacidade')
      .select('*')
      .eq('usuario_id', usuarioId)
      .single();

    if (error) {
      // Se não existe, retornar valores padrão
      if (error.code === 'PGRST116') {
        return {
          sucesso: true,
          dados: {
            id: '',
            usuario_id: usuarioId,
            compartilhar_diario_psicologo: false,
            mostrar_perfil_comunidade: true,
            receber_notificacoes_push: true,
            receber_notificacoes_email: true,
            perfil_anonimo_comunidade: false,
            created_at: null,
            updated_at: null,
          },
        };
      }

      console.error('Erro ao buscar configurações:', error);
      return {
        sucesso: false,
        erro: 'Não foi possível carregar as configurações.',
      };
    }

    return {
      sucesso: true,
      dados: data as ConfiguracoesPrivacidade,
    };
  } catch (erro) {
    console.error('Erro inesperado ao buscar configurações:', erro);
    return {
      sucesso: false,
      erro: 'Erro inesperado ao carregar configurações. Verifique sua conexão.',
    };
  }
};

/**
 * Atualiza as configurações de privacidade do usuário (cria se não existir)
 */
export const atualizarConfiguracoes = async (
  usuarioId: string,
  dados: Partial<ConfiguracoesPrivacidade>
): Promise<ResultadoAuth<ConfiguracoesPrivacidade>> => {
  try {
    const { id, created_at, updated_at, ...dadosAtualizaveis } = dados;

    const { data, error } = await supabase
      .from('configuracoes_privacidade')
      .upsert(
        { usuario_id: usuarioId, ...dadosAtualizaveis },
        { onConflict: 'usuario_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar configurações:', error);
      return {
        sucesso: false,
        erro: 'Não foi possível salvar as configurações.',
      };
    }

    return {
      sucesso: true,
      dados: data as ConfiguracoesPrivacidade,
    };
  } catch (erro) {
    console.error('Erro inesperado ao atualizar configurações:', erro);
    return {
      sucesso: false,
      erro: 'Erro inesperado ao salvar configurações. Verifique sua conexão.',
    };
  }
};

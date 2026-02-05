// Documentação das tabelas do banco de dados Supabase
// Gerado a partir do schema SQL do Transcend

// Tipos enumerados
export type TipoUsuario = 'pessoa_trans' | 'psicologo' | 'moderador' | 'admin';
export type Genero = 'mulher_trans' | 'homem_trans' | 'nao_binario' | 'outro';
export type ViaAdministracao = 'injetavel' | 'gel' | 'adesivo' | 'oral' | 'sublingual';
export type TipoHormonio = 'estradiol' | 'testosterona' | 'progesterona' | 'bloqueador';
export type NivelHumor = 'feliz' | 'triste' | 'neutro' | 'ansioso' | 'irritado';
export type StatusSessao = 'agendada' | 'confirmada' | 'realizada' | 'cancelada' | 'remarcada';
export type TipoNotificacao = 'lembrete_hormonio' | 'sessao_psicologo' | 'comunidade' | 'sistema' | 'conquista';

export interface Database {
  public: {
    Tables: {
      // Perfis de usuários
      perfis: {
        Row: {
          id: string;
          tipo: TipoUsuario;
          nome_social: string;
          nome_civil: string | null;
          email: string;
          telefone: string | null;
          data_nascimento: string | null;
          genero: Genero | null;
          foto_url: string | null;
          bio: string | null;
          cidade: string | null;
          estado: string | null;
          two_factor_enabled: boolean;
          biometria_enabled: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['perfis']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['perfis']['Insert']>;
      };

      // Configurações de privacidade
      configuracoes_privacidade: {
        Row: {
          id: string;
          usuario_id: string;
          compartilhar_diario_psicologo: boolean;
          mostrar_perfil_comunidade: boolean;
          receber_notificacoes_push: boolean;
          receber_notificacoes_email: boolean;
          perfil_anonimo_comunidade: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['configuracoes_privacidade']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['configuracoes_privacidade']['Insert']>;
      };

      // Psicólogos
      psicologos: {
        Row: {
          id: string;
          usuario_id: string;
          crp: string;
          especialidades: string[] | null;
          abordagem: string | null;
          valor_consulta: number | null;
          aceita_convenio: boolean;
          convenios: string[] | null;
          disponibilidade: any | null;
          atende_online: boolean;
          atende_presencial: boolean;
          endereco_consultorio: string | null;
          verificado: boolean;
          verificado_em: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['psicologos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['psicologos']['Insert']>;
      };

      // Planos hormonais
      planos_hormonais: {
        Row: {
          id: string;
          usuario_id: string;
          nome: string;
          tipo_hormonio: TipoHormonio;
          medicamento: string;
          dosagem: string;
          via_administracao: ViaAdministracao;
          frequencia_dias: number;
          horario_preferencial: string | null;
          data_inicio: string;
          data_fim: string | null;
          medico_responsavel: string | null;
          crm_medico: string | null;
          observacoes: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['planos_hormonais']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['planos_hormonais']['Insert']>;
      };

      // Aplicações hormonais
      aplicacoes_hormonais: {
        Row: {
          id: string;
          plano_id: string;
          usuario_id: string;
          data_aplicacao: string;
          dosagem_aplicada: string | null;
          local_aplicacao: string | null;
          lote_medicamento: string | null;
          efeitos_colaterais: string | null;
          nivel_dor: number | null;
          humor_pos_aplicacao: NivelHumor | null;
          notas: string | null;
          foto_comprovante_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['aplicacoes_hormonais']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['aplicacoes_hormonais']['Insert']>;
      };

      // Lembretes hormonais
      lembretes_hormonais: {
        Row: {
          id: string;
          plano_id: string;
          usuario_id: string;
          data_lembrete: string;
          notificado: boolean;
          notificado_em: string | null;
          confirmado: boolean;
          confirmado_em: string | null;
          adiado_para: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lembretes_hormonais']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['lembretes_hormonais']['Insert']>;
      };

      // Entradas do diário
      diario_entradas: {
        Row: {
          id: string;
          usuario_id: string;
          data_entrada: string;
          conteudo: string;
          humor: NivelHumor | null;
          tags: string[] | null;
          compartilhado_psicologo: boolean;
          privado: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['diario_entradas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['diario_entradas']['Insert']>;
      };

      // Fotos do diário
      diario_fotos: {
        Row: {
          id: string;
          entrada_id: string | null;
          usuario_id: string;
          foto_url: string;
          foto_url_encrypted: string | null;
          descricao: string | null;
          categoria: string | null;
          data_foto: string;
          privado: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['diario_fotos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['diario_fotos']['Insert']>;
      };

      // Sessões psicológicas
      sessoes_psicologicas: {
        Row: {
          id: string;
          paciente_id: string;
          psicologo_id: string;
          data_sessao: string;
          duracao_minutos: number;
          status: StatusSessao;
          modalidade: string;
          link_videochamada: string | null;
          valor: number | null;
          pago: boolean;
          notas_paciente: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sessoes_psicologicas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['sessoes_psicologicas']['Insert']>;
      };

      // Anotações do psicólogo
      anotacoes_psicologo: {
        Row: {
          id: string;
          sessao_id: string;
          psicologo_id: string;
          conteudo_encrypted: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['anotacoes_psicologo']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['anotacoes_psicologo']['Insert']>;
      };

      // Comunidades
      comunidades: {
        Row: {
          id: string;
          nome: string;
          descricao: string | null;
          foto_url: string | null;
          banner_url: string | null;
          categoria: string | null;
          regras: string | null;
          privada: boolean;
          requer_aprovacao: boolean;
          criador_id: string | null;
          total_membros: number;
          ativa: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comunidades']['Row'], 'id' | 'created_at' | 'updated_at' | 'total_membros'>;
        Update: Partial<Database['public']['Tables']['comunidades']['Insert']>;
      };

      // Membros da comunidade
      membros_comunidade: {
        Row: {
          id: string;
          comunidade_id: string;
          usuario_id: string;
          papel: string;
          aprovado: boolean;
          silenciado: boolean;
          silenciado_ate: string | null;
          banido: boolean;
          joined_at: string;
        };
        Insert: Omit<Database['public']['Tables']['membros_comunidade']['Row'], 'id' | 'joined_at'>;
        Update: Partial<Database['public']['Tables']['membros_comunidade']['Insert']>;
      };

      // Postagens
      postagens: {
        Row: {
          id: string;
          comunidade_id: string;
          autor_id: string;
          titulo: string | null;
          conteudo: string;
          imagem_url: string | null;
          anonimo: boolean;
          fixado: boolean;
          trancado: boolean;
          total_curtidas: number;
          total_comentarios: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['postagens']['Row'], 'id' | 'created_at' | 'updated_at' | 'total_curtidas' | 'total_comentarios'>;
        Update: Partial<Database['public']['Tables']['postagens']['Insert']>;
      };

      // Comentários
      comentarios: {
        Row: {
          id: string;
          postagem_id: string;
          autor_id: string;
          comentario_pai_id: string | null;
          conteudo: string;
          anonimo: boolean;
          total_curtidas: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['comentarios']['Row'], 'id' | 'created_at' | 'updated_at' | 'total_curtidas'>;
        Update: Partial<Database['public']['Tables']['comentarios']['Insert']>;
      };

      // Curtidas
      curtidas: {
        Row: {
          id: string;
          usuario_id: string;
          postagem_id: string | null;
          comentario_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['curtidas']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['curtidas']['Insert']>;
      };

      // Denúncias
      denuncias: {
        Row: {
          id: string;
          denunciante_id: string;
          postagem_id: string | null;
          comentario_id: string | null;
          usuario_denunciado_id: string | null;
          motivo: string;
          descricao: string | null;
          status: string;
          resolvido_por: string | null;
          resolucao: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['denuncias']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['denuncias']['Insert']>;
      };

      // Notificações
      notificacoes: {
        Row: {
          id: string;
          usuario_id: string;
          tipo: TipoNotificacao;
          titulo: string;
          mensagem: string | null;
          dados: any | null;
          lida: boolean;
          lida_em: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notificacoes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notificacoes']['Insert']>;
      };

      // Log de auditoria
      audit_log: {
        Row: {
          id: string;
          usuario_id: string | null;
          tabela: string;
          operacao: string;
          dados_antigos: any | null;
          dados_novos: any | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_log']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['audit_log']['Insert']>;
      };
    };
  };
}

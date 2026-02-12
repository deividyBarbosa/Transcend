export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anotacoes_psicologo: {
        Row: {
          conteudo_encrypted: string
          created_at: string | null
          id: string
          psicologo_id: string
          sessao_id: string
          updated_at: string | null
        }
        Insert: {
          conteudo_encrypted: string
          created_at?: string | null
          id?: string
          psicologo_id: string
          sessao_id: string
          updated_at?: string | null
        }
        Update: {
          conteudo_encrypted?: string
          created_at?: string | null
          id?: string
          psicologo_id?: string
          sessao_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anotacoes_psicologo_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anotacoes_psicologo_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes_psicologicas"
            referencedColumns: ["id"]
          },
        ]
      }
      aplicacoes_hormonais: {
        Row: {
          atraso: number
          confirmada: boolean | null
          created_at: string | null
          data_aplicacao: string
          efeitos_colaterais: string[] | null
          horario_aplicado: string | null
          horario_previsto: string | null
          humor: number | null
          id: string
          local_aplicacao: string | null
          observacoes: string | null
          plano_id: string
          status: Database["public"]["Enums"]["status_aplicacao"]
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          atraso?: number
          confirmada?: boolean | null
          created_at?: string | null
          data_aplicacao?: string
          efeitos_colaterais?: string[] | null
          horario_aplicado?: string | null
          horario_previsto?: string | null
          humor?: number | null
          id?: string
          local_aplicacao?: string | null
          observacoes?: string | null
          plano_id: string
          status?: Database["public"]["Enums"]["status_aplicacao"]
          updated_at?: string | null
          usuario_id?: string
        }
        Update: {
          atraso?: number
          confirmada?: boolean | null
          created_at?: string | null
          data_aplicacao?: string
          efeitos_colaterais?: string[] | null
          horario_aplicado?: string | null
          horario_previsto?: string | null
          humor?: number | null
          id?: string
          local_aplicacao?: string | null
          observacoes?: string | null
          plano_id?: string
          status?: Database["public"]["Enums"]["status_aplicacao"]
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aplicacoes_hormonais_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_hormonais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aplicacoes_hormonais_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "bem_estar_hoje"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "aplicacoes_hormonais_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          created_at: string | null
          dados_antigos: Json | null
          dados_novos: Json | null
          id: string
          ip_address: unknown
          operacao: string
          tabela: string
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          dados_antigos?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: unknown
          operacao: string
          tabela: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          dados_antigos?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: unknown
          operacao?: string
          tabela?: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      avaliacoes_psicologo: {
        Row: {
          anonimo: boolean | null
          comentario: string | null
          created_at: string | null
          id: string
          nota: number
          paciente_id: string
          psicologo_id: string
        }
        Insert: {
          anonimo?: boolean | null
          comentario?: string | null
          created_at?: string | null
          id?: string
          nota: number
          paciente_id: string
          psicologo_id: string
        }
        Update: {
          anonimo?: boolean | null
          comentario?: string | null
          created_at?: string | null
          id?: string
          nota?: number
          paciente_id?: string
          psicologo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_psicologo_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "bem_estar_hoje"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "avaliacoes_psicologo_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_psicologo_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_privacidade: {
        Row: {
          compartilhar_diario_psicologo: boolean | null
          created_at: string | null
          id: string
          mostrar_perfil_comunidade: boolean | null
          perfil_anonimo_comunidade: boolean | null
          receber_notificacoes_email: boolean | null
          receber_notificacoes_push: boolean | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          compartilhar_diario_psicologo?: boolean | null
          created_at?: string | null
          id?: string
          mostrar_perfil_comunidade?: boolean | null
          perfil_anonimo_comunidade?: boolean | null
          receber_notificacoes_email?: boolean | null
          receber_notificacoes_push?: boolean | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          compartilhar_diario_psicologo?: boolean | null
          created_at?: string | null
          id?: string
          mostrar_perfil_comunidade?: boolean | null
          perfil_anonimo_comunidade?: boolean | null
          receber_notificacoes_email?: boolean | null
          receber_notificacoes_push?: boolean | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_privacidade_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "bem_estar_hoje"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "configuracoes_privacidade_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      contatos_medicos: {
        Row: {
          created_at: string | null
          crm: string | null
          email: string | null
          endereco: string | null
          especialidade: string | null
          favorito: boolean | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          crm?: string | null
          email?: string | null
          endereco?: string | null
          especialidade?: string | null
          favorito?: boolean | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          crm?: string | null
          email?: string | null
          endereco?: string | null
          especialidade?: string | null
          favorito?: boolean | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contatos_medicos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "bem_estar_hoje"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "contatos_medicos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      conversas: {
        Row: {
          ativa: boolean | null
          created_at: string | null
          id: string
          mensagens_nao_lidas_paciente: number | null
          mensagens_nao_lidas_psicologo: number | null
          paciente_id: string
          psicologo_id: string
          ultima_mensagem_em: string | null
          ultima_mensagem_preview: string | null
          updated_at: string | null
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string | null
          id?: string
          mensagens_nao_lidas_paciente?: number | null
          mensagens_nao_lidas_psicologo?: number | null
          paciente_id: string
          psicologo_id: string
          ultima_mensagem_em?: string | null
          ultima_mensagem_preview?: string | null
          updated_at?: string | null
        }
        Update: {
          ativa?: boolean | null
          created_at?: string | null
          id?: string
          mensagens_nao_lidas_paciente?: number | null
          mensagens_nao_lidas_psicologo?: number | null
          paciente_id?: string
          psicologo_id?: string
          ultima_mensagem_em?: string | null
          ultima_mensagem_preview?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "bem_estar_hoje"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "conversas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
      diario_entradas: {
        Row: {
          compartilhado_em: string | null
          compartilhado_psicologo: boolean | null
          conteudo: string
          created_at: string | null
          data_entrada: string
          foto_url: string | null
          humor: Database["public"]["Enums"]["nivel_humor"] | null
          id: string
          is_importante: boolean
          privado: boolean | null
          tags: string[] | null
          tipo: Database["public"]["Enums"]["tipo_entrada"]
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          compartilhado_em?: string | null
          compartilhado_psicologo?: boolean | null
          conteudo: string
          created_at?: string | null
          data_entrada?: string
          foto_url?: string | null
          humor?: Database["public"]["Enums"]["nivel_humor"] | null
          id?: string
          is_importante?: boolean
          privado?: boolean | null
          tags?: string[] | null
          tipo?: Database["public"]["Enums"]["tipo_entrada"]
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          compartilhado_em?: string | null
          compartilhado_psicologo?: boolean | null
          conteudo?: string
          created_at?: string | null
          data_entrada?: string
          foto_url?: string | null
          humor?: Database["public"]["Enums"]["nivel_humor"] | null
          id?: string
          is_importante?: boolean
          privado?: boolean | null
          tags?: string[] | null
          tipo?: Database["public"]["Enums"]["tipo_entrada"]
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diario_entradas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "bem_estar_hoje"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "diario_entradas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      disponibilidade_psicologo: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          dia_semana: number
          horario_fim: string
          horario_inicio: string
          id: string
          modalidade: string | null
          psicologo_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          dia_semana: number
          horario_fim: string
          horario_inicio: string
          id?: string
          modalidade?: string | null
          psicologo_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          dia_semana?: number
          horario_fim?: string
          horario_inicio?: string
          id?: string
          modalidade?: string | null
          psicologo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disponibilidade_psicologo_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
      horarios_bloqueados: {
        Row: {
          created_at: string | null
          data: string
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          psicologo_id: string
        }
        Insert: {
          created_at?: string | null
          data: string
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          psicologo_id: string
        }
        Update: {
          created_at?: string | null
          data?: string
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          psicologo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "horarios_bloqueados_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
      lembretes_hormonais: {
        Row: {
          adiado_para: string | null
          confirmado: boolean | null
          confirmado_em: string | null
          created_at: string | null
          data_lembrete: string
          id: string
          notificado: boolean | null
          notificado_em: string | null
          plano_id: string
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          adiado_para?: string | null
          confirmado?: boolean | null
          confirmado_em?: string | null
          created_at?: string | null
          data_lembrete: string
          id?: string
          notificado?: boolean | null
          notificado_em?: string | null
          plano_id: string
          updated_at?: string | null
          usuario_id?: string
        }
        Update: {
          adiado_para?: string | null
          confirmado?: boolean | null
          confirmado_em?: string | null
          created_at?: string | null
          data_lembrete?: string
          id?: string
          notificado?: boolean | null
          notificado_em?: string | null
          plano_id?: string
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lembretes_hormonais_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_hormonais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lembretes_hormonais_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "bem_estar_hoje"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "lembretes_hormonais_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens: {
        Row: {
          arquivo_nome: string | null
          arquivo_url: string | null
          conteudo: string
          conversa_id: string
          created_at: string | null
          id: string
          lida: boolean | null
          lida_em: string | null
          remetente_id: string
          tipo: string | null
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          conteudo: string
          conversa_id: string
          created_at?: string | null
          id?: string
          lida?: boolean | null
          lida_em?: string | null
          remetente_id: string
          tipo?: string | null
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          conteudo?: string
          conversa_id?: string
          created_at?: string | null
          id?: string
          lida?: boolean | null
          lida_em?: string | null
          remetente_id?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "conversas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_remetente_id_fkey"
            columns: ["remetente_id"]
            isOneToOne: false
            referencedRelation: "bem_estar_hoje"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "mensagens_remetente_id_fkey"
            columns: ["remetente_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string | null
          dados: Json | null
          id: string
          lida: boolean | null
          lida_em: string | null
          mensagem: string | null
          tipo: Database["public"]["Enums"]["tipo_notificacao"]
          titulo: string
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          dados?: Json | null
          id?: string
          lida?: boolean | null
          lida_em?: string | null
          mensagem?: string | null
          tipo: Database["public"]["Enums"]["tipo_notificacao"]
          titulo: string
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          dados?: Json | null
          id?: string
          lida?: boolean | null
          lida_em?: string | null
          mensagem?: string | null
          tipo?: Database["public"]["Enums"]["tipo_notificacao"]
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "bem_estar_hoje"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "notificacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          bio: string | null
          created_at: string
          data_nascimento: string | null
          deleted_at: string | null
          email: string
          foto_url: string | null
          genero: Database["public"]["Enums"]["genero"]
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["tipo_usuario"]
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          data_nascimento?: string | null
          deleted_at?: string | null
          email: string
          foto_url?: string | null
          genero: Database["public"]["Enums"]["genero"]
          id: string
          nome: string
          tipo?: Database["public"]["Enums"]["tipo_usuario"]
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          data_nascimento?: string | null
          deleted_at?: string | null
          email?: string
          foto_url?: string | null
          genero?: Database["public"]["Enums"]["genero"]
          id?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["tipo_usuario"]
          updated_at?: string | null
        }
        Relationships: []
      }
      planos_hormonais: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_inicio: string
          dias_semana: number[] | null
          dosagem: string
          frequencia: string
          horario_preferencial: string | null
          id: string
          modo_aplicacao: string
          nome: string
          observacoes: string | null
          unidade_dosagem: string
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_inicio: string
          dias_semana?: number[] | null
          dosagem: string
          frequencia?: string
          horario_preferencial?: string | null
          id?: string
          modo_aplicacao?: string
          nome: string
          observacoes?: string | null
          unidade_dosagem?: string
          updated_at?: string | null
          usuario_id?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_inicio?: string
          dias_semana?: number[] | null
          dosagem?: string
          frequencia?: string
          horario_preferencial?: string | null
          id?: string
          modo_aplicacao?: string
          nome?: string
          observacoes?: string | null
          unidade_dosagem?: string
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planos_hormonais_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "bem_estar_hoje"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "planos_hormonais_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      psicologos: {
        Row: {
          abordagem: string | null
          aceita_convenio: boolean | null
          anos_experiencia: number | null
          atende_online: boolean | null
          atende_presencial: boolean | null
          avaliacao_media: number | null
          bio: string | null
          convenios: string[] | null
          created_at: string | null
          crp: string
          descricao: string | null
          disponibilidade: Json | null
          duracao_sessao: number | null
          endereco_consultorio: string | null
          especialidades: string[] | null
          foto_url: string | null
          id: string
          titulo: string | null
          total_avaliacoes: number | null
          total_pacientes: number | null
          updated_at: string | null
          usuario_id: string
          valor_consulta: number | null
          verificado: boolean | null
          verificado_em: string | null
        }
        Insert: {
          abordagem?: string | null
          aceita_convenio?: boolean | null
          anos_experiencia?: number | null
          atende_online?: boolean | null
          atende_presencial?: boolean | null
          avaliacao_media?: number | null
          bio?: string | null
          convenios?: string[] | null
          created_at?: string | null
          crp: string
          descricao?: string | null
          disponibilidade?: Json | null
          duracao_sessao?: number | null
          endereco_consultorio?: string | null
          especialidades?: string[] | null
          foto_url?: string | null
          id?: string
          titulo?: string | null
          total_avaliacoes?: number | null
          total_pacientes?: number | null
          updated_at?: string | null
          usuario_id: string
          valor_consulta?: number | null
          verificado?: boolean | null
          verificado_em?: string | null
        }
        Update: {
          abordagem?: string | null
          aceita_convenio?: boolean | null
          anos_experiencia?: number | null
          atende_online?: boolean | null
          atende_presencial?: boolean | null
          avaliacao_media?: number | null
          bio?: string | null
          convenios?: string[] | null
          created_at?: string | null
          crp?: string
          descricao?: string | null
          disponibilidade?: Json | null
          duracao_sessao?: number | null
          endereco_consultorio?: string | null
          especialidades?: string[] | null
          foto_url?: string | null
          id?: string
          titulo?: string | null
          total_avaliacoes?: number | null
          total_pacientes?: number | null
          updated_at?: string | null
          usuario_id?: string
          valor_consulta?: number | null
          verificado?: boolean | null
          verificado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psicologos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "bem_estar_hoje"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "psicologos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      sessoes_psicologicas: {
        Row: {
          cancelado_por: string | null
          chat_id: string | null
          created_at: string | null
          data_sessao: string
          duracao_minutos: number | null
          forma_pagamento: string | null
          id: string
          link_videochamada: string | null
          modalidade: string | null
          motivo_cancelamento: string | null
          notas_paciente: string | null
          numero_atendimento: string | null
          paciente_id: string
          pagamento_confirmado: boolean | null
          pagamento_confirmado_em: string | null
          pago: boolean | null
          psicologo_id: string
          status: Database["public"]["Enums"]["status_sessao"] | null
          updated_at: string | null
          valor: number | null
          valor_pago: number | null
        }
        Insert: {
          cancelado_por?: string | null
          chat_id?: string | null
          created_at?: string | null
          data_sessao: string
          duracao_minutos?: number | null
          forma_pagamento?: string | null
          id?: string
          link_videochamada?: string | null
          modalidade?: string | null
          motivo_cancelamento?: string | null
          notas_paciente?: string | null
          numero_atendimento?: string | null
          paciente_id: string
          pagamento_confirmado?: boolean | null
          pagamento_confirmado_em?: string | null
          pago?: boolean | null
          psicologo_id: string
          status?: Database["public"]["Enums"]["status_sessao"] | null
          updated_at?: string | null
          valor?: number | null
          valor_pago?: number | null
        }
        Update: {
          cancelado_por?: string | null
          chat_id?: string | null
          created_at?: string | null
          data_sessao?: string
          duracao_minutos?: number | null
          forma_pagamento?: string | null
          id?: string
          link_videochamada?: string | null
          modalidade?: string | null
          motivo_cancelamento?: string | null
          notas_paciente?: string | null
          numero_atendimento?: string | null
          paciente_id?: string
          pagamento_confirmado?: boolean | null
          pagamento_confirmado_em?: string | null
          pago?: boolean | null
          psicologo_id?: string
          status?: Database["public"]["Enums"]["status_sessao"] | null
          updated_at?: string | null
          valor?: number | null
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_psicologicas_cancelado_por_fkey"
            columns: ["cancelado_por"]
            isOneToOne: false
            referencedRelation: "bem_estar_hoje"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "sessoes_psicologicas_cancelado_por_fkey"
            columns: ["cancelado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_psicologicas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "bem_estar_hoje"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "sessoes_psicologicas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_psicologicas_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
      vinculos_psicologo: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          encerrado_em: string | null
          id: string
          paciente_id: string
          psicologo_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          encerrado_em?: string | null
          id?: string
          paciente_id: string
          psicologo_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          encerrado_em?: string | null
          id?: string
          paciente_id?: string
          psicologo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vinculos_psicologo_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "bem_estar_hoje"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "vinculos_psicologo_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_psicologo_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      bem_estar_hoje: {
        Row: {
          data: string | null
          humor: Database["public"]["Enums"]["nivel_humor"] | null
          sintomas: string[] | null
          usuario_id: string | null
        }
        Insert: {
          data?: never
          humor?: never
          sintomas?: never
          usuario_id?: string | null
        }
        Update: {
          data?: never
          humor?: never
          sintomas?: never
          usuario_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      atualizar_diario_criptografado: {
        Args: {
          p_conteudo?: string
          p_entrada_id: string
          p_humor?: string
          p_is_importante?: boolean
          p_tags?: string[]
        }
        Returns: boolean
      }
      atualizar_perfil_psicologo: {
        Args: {
          p_anos_experiencia?: number
          p_descricao?: string
          p_especialidades?: string[]
          p_foto_url?: string
          p_titulo?: string
          p_usuario_id: string
        }
        Returns: Json
      }
      buscar_anotacoes_psicologo: {
        Args: { p_sessao_id: string }
        Returns: {
          conteudo: string
          created_at: string
          id: string
          sessao_id: string
          updated_at: string
        }[]
      }
      buscar_dados_tela_inicial: {
        Args: { p_usuario_id: string }
        Returns: Json
      }
      buscar_diario_descriptografado: {
        Args: { p_data_fim?: string; p_data_inicio?: string; p_limite?: number }
        Returns: {
          compartilhado_em: string
          compartilhado_psicologo: boolean
          conteudo: string
          created_at: string
          data_entrada: string
          humor: string
          id: string
          is_importante: boolean
          privado: boolean
          tags: string[]
          tipo: string
          updated_at: string
        }[]
      }
      buscar_historico_chats_paciente: {
        Args: { p_paciente_id: string }
        Returns: Json
      }
      buscar_historico_chats_psicologo: {
        Args: { p_psicologo_usuario_id: string }
        Returns: Json
      }
      buscar_horarios_disponiveis: {
        Args: { p_data: string; p_psicologo_id: string }
        Returns: {
          horario_fim: string
          horario_inicio: string
          modalidade: string
        }[]
      }
      buscar_mensagens_conversa: {
        Args: {
          p_conversa_id: string
          p_limite?: number
          p_offset?: number
          p_usuario_id: string
        }
        Returns: Json
      }
      buscar_mensagens_descriptografadas: {
        Args: { p_conversa_id: string; p_limite?: number; p_offset?: number }
        Returns: {
          conteudo: string
          conversa_id: string
          created_at: string
          id: string
          lida: boolean
          lida_em: string
          remetente_id: string
          tipo: string
        }[]
      }
      buscar_meu_perfil_psicologo: {
        Args: { p_usuario_id: string }
        Returns: Json
      }
      buscar_perfil_psicologo: {
        Args: { p_psicologo_id: string }
        Returns: Json
      }
      decrypt_data: { Args: { encrypted_text: string }; Returns: string }
      encrypt_data: { Args: { data_text: string }; Returns: string }
      enviar_mensagem: {
        Args: {
          p_arquivo_nome?: string
          p_arquivo_url?: string
          p_conteudo: string
          p_destinatario_id: string
          p_remetente_id: string
          p_tipo?: string
        }
        Returns: Json
      }
      enviar_mensagem_criptografada: {
        Args: { p_conteudo: string; p_conversa_id: string; p_tipo?: string }
        Returns: string
      }
      excluir_diario: { Args: { p_entrada_id: string }; Returns: boolean }
      get_encryption_key: { Args: never; Returns: string }
      marcar_mensagens_lidas: {
        Args: { p_conversa_id: string; p_usuario_id: string }
        Returns: undefined
      }
      migrar_diario_para_criptografado: {
        Args: never
        Returns: {
          migrados: number
        }[]
      }
      salvar_anotacao_psicologo: {
        Args: { p_conteudo: string; p_sessao_id: string }
        Returns: string
      }
      salvar_diario_criptografado: {
        Args: {
          p_conteudo: string
          p_data_entrada: string
          p_humor?: string
          p_privado?: boolean
          p_tags?: string[]
          p_tipo?: string
        }
        Returns: string
      }
      salvar_nota_paciente_sessao: {
        Args: { p_notas: string; p_sessao_id: string }
        Returns: boolean
      }
    }
    Enums: {
      genero: "mulher_trans" | "homem_trans" | "nao_binario" | "outro"
      nivel_humor: "feliz" | "neutro" | "triste" | "ansioso" | "irritado"
      status_aplicacao: "aplicado" | "atrasado" | "pendente"
      status_sessao:
        | "agendada"
        | "confirmada"
        | "realizada"
        | "cancelada"
        | "remarcada"
      tipo_entrada: "diario" | "evento" | "marco"
      tipo_foto: "diario" | "transicao"
      tipo_notificacao:
        | "lembrete_hormonio"
        | "sessao_psicologo"
        | "comunidade"
        | "sistema"
        | "conquista"
      tipo_remetente: "PACIENTE" | "PSICOLOGO" | "SISTEMA"
      tipo_usuario: "pessoa_trans" | "psicologo" | "moderador" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      genero: ["mulher_trans", "homem_trans", "nao_binario", "outro"],
      nivel_humor: ["feliz", "neutro", "triste", "ansioso", "irritado"],
      status_aplicacao: ["aplicado", "atrasado", "pendente"],
      status_sessao: [
        "agendada",
        "confirmada",
        "realizada",
        "cancelada",
        "remarcada",
      ],
      tipo_entrada: ["diario", "evento", "marco"],
      tipo_foto: ["diario", "transicao"],
      tipo_notificacao: [
        "lembrete_hormonio",
        "sessao_psicologo",
        "comunidade",
        "sistema",
        "conquista",
      ],
      tipo_remetente: ["PACIENTE", "PSICOLOGO", "SISTEMA"],
      tipo_usuario: ["pessoa_trans", "psicologo", "moderador", "admin"],
    },
  },
} as const

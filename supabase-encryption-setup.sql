-- ============================================================================
-- CONFIGURAÇÃO DE CRIPTOGRAFIA NO SUPABASE
-- ============================================================================
-- Este arquivo contém scripts SQL para configurar recursos de criptografia
-- no banco de dados Supabase do projeto Transcend.
--
-- Execute estes comandos no SQL Editor do Supabase Dashboard
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ATIVAR EXTENSÕES DE CRIPTOGRAFIA
-- ----------------------------------------------------------------------------

-- Ativa a extensão pgcrypto (funções criptográficas básicas)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ativa o Supabase Vault (gerenciamento seguro de segredos)
CREATE EXTENSION IF NOT EXISTS supabase_vault CASCADE;

-- ----------------------------------------------------------------------------
-- 2. CRIAR FUNÇÕES HELPER PARA CRIPTOGRAFIA DE COLUNAS (OPCIONAL)
-- ----------------------------------------------------------------------------

-- Função para criptografar texto usando AES-256
-- Uso: UPDATE tabela SET coluna_criptografada = encrypt_text('meu texto', 'chave');
CREATE OR REPLACE FUNCTION encrypt_text(
  texto TEXT,
  chave TEXT
) RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(texto, chave);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para descriptografar texto
-- Uso: SELECT decrypt_text(coluna_criptografada, 'chave') FROM tabela;
CREATE OR REPLACE FUNCTION decrypt_text(
  texto_criptografado BYTEA,
  chave TEXT
) RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(texto_criptografado, chave);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 3. EXEMPLO: ADICIONAR COLUNA CRIPTOGRAFADA À TABELA DE DIÁRIO
-- ----------------------------------------------------------------------------

-- Adiciona coluna para armazenar conteúdo criptografado
-- (mantenha a coluna 'conteudo' original para compatibilidade)
ALTER TABLE diario_entradas
ADD COLUMN IF NOT EXISTS conteudo_criptografado BYTEA;

-- Adiciona índice para melhorar performance (se necessário)
CREATE INDEX IF NOT EXISTS idx_diario_entradas_criptografado
ON diario_entradas(id)
WHERE conteudo_criptografado IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 4. EXEMPLO: TABELA PARA ARMAZENAR DADOS HORMONAIS CRIPTOGRAFADOS
-- ----------------------------------------------------------------------------

-- Tabela para metadados de hormônios (não sensíveis)
-- Dados sensíveis ficam em 'dados_criptografados'
CREATE TABLE IF NOT EXISTS planos_hormonais_seguros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metadados não sensíveis (podem ser usados em queries)
  nome_medicamento TEXT NOT NULL,
  tipo_aplicacao TEXT, -- 'injetavel', 'oral', 'transdermico'
  status TEXT DEFAULT 'ativo', -- 'ativo', 'pausado', 'concluido'

  -- Dados sensíveis criptografados (dosagem, observações, etc.)
  dados_criptografados BYTEA,

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- RLS: Usuário só acessa seus próprios planos
ALTER TABLE planos_hormonais_seguros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários acessam apenas seus planos hormonais"
ON planos_hormonais_seguros
FOR ALL
USING (auth.uid() = usuario_id);

-- ----------------------------------------------------------------------------
-- 5. CONFIGURAR RLS PARA SUPABASE VAULT
-- ----------------------------------------------------------------------------

-- IMPORTANTE: Por padrão, o Vault já tem RLS ativado.
-- Apenas usuários com privilégios específicos podem acessar vault.decrypted_secrets

-- Verificar políticas existentes:
-- SELECT * FROM pg_policies WHERE tablename = 'secrets' AND schemaname = 'vault';

-- Se você precisar criar uma função do servidor que acesse o Vault,
-- conceda permissões específicas:

-- Exemplo: Função para buscar token de integração
CREATE OR REPLACE FUNCTION get_integration_token(token_name TEXT)
RETURNS TEXT AS $$
DECLARE
  token_value TEXT;
BEGIN
  -- Apenas usuários autenticados
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  -- Busca o token do Vault
  SELECT decrypted_secret INTO token_value
  FROM vault.decrypted_secrets
  WHERE name = token_name
  AND key_id = (SELECT id FROM vault.keys WHERE name = 'default' LIMIT 1);

  RETURN token_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoga acesso público e concede apenas para usuários autenticados
REVOKE ALL ON FUNCTION get_integration_token FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_integration_token TO authenticated;

-- ----------------------------------------------------------------------------
-- 6. CRIAR TRIGGER PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica trigger à tabela de planos hormonais seguros
DROP TRIGGER IF EXISTS update_planos_hormonais_seguros_updated_at ON planos_hormonais_seguros;
CREATE TRIGGER update_planos_hormonais_seguros_updated_at
  BEFORE UPDATE ON planos_hormonais_seguros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 7. EXEMPLO: INSERIR SEGREDOS NO VAULT
-- ----------------------------------------------------------------------------

-- Inserir um token de API de exemplo
-- Execute isso manualmente, substituindo pelos valores reais
/*
SELECT vault.create_secret(
  'seu-token-secreto-aqui',
  'api_token_exemplo',
  'Token de API para serviço X'
);
*/

-- Buscar todos os segredos (apenas nomes, sem valores)
-- SELECT id, name, description, created_at FROM vault.secrets;

-- Buscar valor descriptografado de um segredo específico
-- SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'api_token_exemplo';

-- ----------------------------------------------------------------------------
-- 8. FUNÇÕES DE BACKUP E AUDITORIA
-- ----------------------------------------------------------------------------

-- Tabela de auditoria para acessos a dados criptografados
CREATE TABLE IF NOT EXISTS audit_acesso_dados_sensiveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  tabela TEXT NOT NULL,
  registro_id UUID NOT NULL,
  operacao TEXT NOT NULL, -- 'leitura', 'escrita', 'descriptografia'
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Apenas admins podem ver logs de auditoria
ALTER TABLE audit_acesso_dados_sensiveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admins veem auditoria"
ON audit_acesso_dados_sensiveis
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_usuario IN ('admin', 'moderador')
  )
);

-- Função para registrar acesso
CREATE OR REPLACE FUNCTION registrar_acesso_sensivel(
  p_tabela TEXT,
  p_registro_id UUID,
  p_operacao TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_acesso_dados_sensiveis (usuario_id, tabela, registro_id, operacao)
  VALUES (auth.uid(), p_tabela, p_registro_id, p_operacao);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 9. VERIFICAÇÕES DE SEGURANÇA
-- ----------------------------------------------------------------------------

-- Verificar se RLS está ativado em todas as tabelas sensíveis
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname IN ('public', 'vault')
AND tablename IN (
  'perfis',
  'diario_entradas',
  'planos_hormonais',
  'planos_hormonais_seguros',
  'secrets'
)
ORDER BY tablename;

-- Verificar políticas RLS existentes
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname IN ('public', 'vault')
ORDER BY tablename, policyname;

-- ----------------------------------------------------------------------------
-- 10. NOTAS IMPORTANTES
-- ----------------------------------------------------------------------------

/*
ESTRATÉGIAS DE CRIPTOGRAFIA RECOMENDADAS PARA TRANSCEND:

1. DADOS EXTREMAMENTE SENSÍVEIS (Diário pessoal, fotos íntimas):
   - Criptografia client-side (no app React Native)
   - Usuário é o único que possui a chave
   - Banco armazena apenas dados criptografados
   - Desvantagem: Não há recuperação se perder a senha

2. DADOS SENSÍVEIS MAS RECUPERÁVEIS (Plano hormonal, aplicações):
   - Usar Supabase Vault ou pgcrypto
   - Chaves gerenciadas pelo Supabase
   - Permite recuperação de senha
   - Ainda criptografado em repouso

3. DADOS PESSOAIS NÃO CRÍTICOS (Nome social, preferências):
   - RLS (Row Level Security) é suficiente
   - Criptografia em trânsito (HTTPS) e em repouso (disco) automática
   - Sem overhead de criptografia adicional

4. ARQUIVOS E IMAGENS:
   - Usar Supabase Storage com políticas RLS
   - Já possui criptografia em trânsito e repouso
   - Considerar adicionar criptografia client-side para fotos muito sensíveis

CONFORMIDADE LGPD:
- Implementar direito ao esquecimento (soft delete com deleted_at)
- Permitir exportação de dados (data portability)
- Logs de auditoria para acessos (tabela audit_acesso_dados_sensiveis)
- Criptografia forte para dados de saúde (Art. 11, II da LGPD)
- Minimização de dados: criptografar apenas o necessário

PERFORMANCE:
- Criptografia tem custo computacional
- Não criptografar dados usados em queries/filtros (use RLS)
- Criptografar apenas colunas com dados realmente sensíveis
- Considerar cache em memória para dados descriptografados (com cuidado)

GERENCIAMENTO DE CHAVES:
- Rotação de chaves: Planejar como re-criptografar dados antigos
- Backup de chaves: Supabase gerencia chaves do Vault automaticamente
- Para criptografia client-side: Derivar chaves da senha do usuário
- Considerar usar biometria do device para criptografia local
*/

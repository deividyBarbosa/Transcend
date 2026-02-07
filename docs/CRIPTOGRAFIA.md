# Guia de Criptografia - Transcend

Este documento descreve como implementar criptografia para proteger dados sensíveis dos usuários no app Transcend.

## Índice

1. [Visão Geral](#visão-geral)
2. [Estratégias de Criptografia](#estratégias-de-criptografia)
3. [Implementação Client-Side](#implementação-client-side)
4. [Implementação Server-Side (Vault)](#implementação-server-side-vault)
5. [Configuração do Supabase](#configuração-do-supabase)
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Conformidade LGPD](#conformidade-lgpd)
8. [FAQ](#faq)

---

## Visão Geral

O Transcend lida com dados extremamente sensíveis de saúde e identidade de pessoas trans. Implementar criptografia robusta é **essencial** para:

- ✅ Proteger dados médicos (plano hormonal, aplicações)
- ✅ Garantir privacidade do diário pessoal
- ✅ Cumprir requisitos da LGPD para dados de saúde
- ✅ Prevenir vazamentos em caso de breach no banco
- ✅ Dar controle total ao usuário sobre seus dados

### O que o Supabase já fornece

Por padrão, o Supabase oferece:

- **Criptografia em trânsito**: HTTPS/TLS para todas as requisições
- **Criptografia em repouso**: Disco criptografado (AES-256)
- **Row Level Security (RLS)**: Controle de acesso em nível de linha
- **Autenticação segura**: JWT tokens, bcrypt para senhas

Porém, se alguém obtiver acesso ao banco de dados (backup, funcionário malicioso, breach), os dados estariam legíveis. **Criptografia adicional** resolve isso.

---

## Estratégias de Criptografia

### 1. Client-Side Encryption (Mais seguro)

**Como funciona:**
- Dados são criptografados **no dispositivo do usuário** antes de enviar ao servidor
- Chave de criptografia é derivada da senha do usuário
- Servidor armazena apenas dados criptografados
- Nem mesmo administradores do Supabase podem ler os dados

**Vantagens:**
- ✅ Máxima privacidade (zero-knowledge)
- ✅ Usuário tem controle total
- ✅ Proteção contra breaches no servidor

**Desvantagens:**
- ❌ Sem recuperação de senha (se esquecer, perde os dados)
- ❌ Não é possível fazer queries/buscas sobre dados criptografados
- ❌ Maior complexidade na implementação

**Quando usar:**
- Diário pessoal e anotações
- Fotos sensíveis (antes/depois de transição)
- Dados extremamente privados

### 2. Server-Side Encryption com Supabase Vault

**Como funciona:**
- Dados são criptografados no servidor usando **Supabase Vault**
- Chaves de criptografia são gerenciadas pelo Supabase (fora do banco)
- Permite recuperação de senha
- Você pode fazer queries limitadas

**Vantagens:**
- ✅ Recuperação de senha funciona
- ✅ Mais fácil de implementar
- ✅ Permite algumas queries sobre dados

**Desvantagens:**
- ❌ Menos privado que client-side (servidor tem acesso)
- ❌ Confia no Supabase para gerenciar chaves

**Quando usar:**
- Plano hormonal e histórico de aplicações
- Dados de sessões psicológicas
- Tokens de integração com outros sistemas

### 3. Hybrid Approach (Recomendado para Transcend)

Combine as duas estratégias:

| Tipo de Dado | Estratégia | Razão |
|--------------|------------|-------|
| Diário pessoal | Client-side | Máxima privacidade |
| Fotos do diário | Client-side | Conteúdo muito sensível |
| Plano hormonal | Server-side (Vault) | Precisa recuperar se esquecer senha |
| Aplicações hormonais | Server-side (Vault) | Médico pode precisar acessar |
| Sessões psicológicas | Server-side (Vault) | Psicólogo precisa acessar |
| Nome social, bio | Apenas RLS | Não é tão sensível |
| Comunidade (posts) | Apenas RLS | Conteúdo público/semi-público |

---

## Implementação Client-Side

### Passo 1: Instalar Biblioteca de Criptografia

```bash
# Para React Native/Expo
npm install crypto-js

# OU, para melhor performance (requer config nativa)
npm install react-native-quick-crypto
```

### Passo 2: Atualizar `src/services/crypto.ts`

Substitua as funções `criptografar` e `descriptografar` por implementações reais usando AES-256:

```typescript
import CryptoJS from 'crypto-js';

export async function criptografar(
  texto: string,
  chave: string
): Promise<string> {
  try {
    const criptografado = CryptoJS.AES.encrypt(texto, chave).toString();
    return criptografado;
  } catch (erro) {
    console.error('Erro ao criptografar:', erro);
    throw new Error('Erro ao criptografar dados');
  }
}

export async function descriptografar(
  textoCriptografado: string,
  chave: string
): Promise<string> {
  try {
    const bytes = CryptoJS.AES.decrypt(textoCriptografado, chave);
    const textoOriginal = bytes.toString(CryptoJS.enc.Utf8);

    if (!textoOriginal) {
      throw new Error('Falha ao descriptografar - chave incorreta');
    }

    return textoOriginal;
  } catch (erro) {
    console.error('Erro ao descriptografar:', erro);
    throw new Error('Erro ao descriptografar dados');
  }
}
```

### Passo 3: Derivar Chave da Senha do Usuário

```typescript
import CryptoJS from 'crypto-js';

export function gerarChaveCriptografia(
  senha: string,
  salt: string
): string {
  // Usa PBKDF2 com 10000 iterações para derivar chave de 256 bits
  const chave = CryptoJS.PBKDF2(senha, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  });

  return chave.toString();
}
```

### Passo 4: Armazenar Chave com Segurança (Opcional)

Para não pedir a senha toda vez, você pode armazenar a chave derivada usando **Expo SecureStore**:

```bash
npx expo install expo-secure-store
```

```typescript
import * as SecureStore from 'expo-secure-store';

// Salvar chave após login
export async function salvarChaveCriptografia(chave: string): Promise<void> {
  await SecureStore.setItemAsync('chave_cripto', chave);
}

// Recuperar chave
export async function recuperarChaveCriptografia(): Promise<string | null> {
  return await SecureStore.getItemAsync('chave_cripto');
}

// Remover chave ao fazer logout
export async function removerChaveCriptografia(): Promise<void> {
  await SecureStore.deleteItemAsync('chave_cripto');
}
```

---

## Implementação Server-Side (Vault)

### Passo 1: Ativar Vault no Supabase

Execute no **SQL Editor** do Supabase Dashboard:

```sql
CREATE EXTENSION IF NOT EXISTS supabase_vault CASCADE;
```

### Passo 2: Criar Segredos

```typescript
import { criarSegredoVault } from '@/services/crypto';

// Exemplo: Salvar token de integração
const segredoId = await criarSegredoVault(
  'token_api_exemplo_12345',
  'token_servico_x',
  'Token de API para integração com Serviço X'
);
```

### Passo 3: Buscar Segredos

```typescript
import { buscarSegredoVault } from '@/services/crypto';

const token = await buscarSegredoVault(segredoId);
console.log('Token recuperado:', token);
```

### Passo 4: Configurar RLS para Vault

Por padrão, apenas funções do servidor podem acessar `vault.decrypted_secrets`. Crie funções PostgreSQL para acesso controlado:

```sql
-- Ver exemplo completo em supabase-encryption-setup.sql
CREATE OR REPLACE FUNCTION get_integration_token(token_name TEXT)
RETURNS TEXT AS $$
DECLARE
  token_value TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT decrypted_secret INTO token_value
  FROM vault.decrypted_secrets
  WHERE name = token_name;

  RETURN token_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Configuração do Supabase

Execute os scripts em `supabase-encryption-setup.sql` na ordem:

1. ✅ Ativar extensões (`pgcrypto`, `supabase_vault`)
2. ✅ Criar funções helper de criptografia
3. ✅ Adicionar colunas criptografadas às tabelas existentes
4. ✅ Configurar RLS para tabelas sensíveis
5. ✅ Criar tabela de auditoria para acessos

---

## Exemplos de Uso

### Exemplo 1: Criptografar Entrada do Diário (Client-Side)

```typescript
// Em src/app/(protected)/pessoa-trans/(tabs-pessoatrans)/diario.tsx

import {
  criptografarEntradaDiario,
  gerarChaveCriptografia,
  salvarChaveCriptografia,
} from '@/services/crypto';
import { supabase } from '@/utils/supabase';

async function salvarEntradaDiario() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Gera chave da senha do usuário (pedir senha ou usar chave armazenada)
  const senha = await pedirSenhaUsuario(); // Implementar prompt
  const chave = gerarChaveCriptografia(senha, user.id);

  // Criptografa conteúdo
  const conteudoCriptografado = await criptografarEntradaDiario(
    textoEntrada,
    user.id,
    senha
  );

  // Salva no banco
  const { error } = await supabase.from('diario_entradas').insert({
    usuario_id: user.id,
    data: new Date().toISOString(),
    conteudo_criptografado: conteudoCriptografado,
    conteudo: null, // Mantém null para indicar que está criptografado
  });

  if (!error) {
    // Salva chave no SecureStore para não pedir novamente
    await salvarChaveCriptografia(chave);
  }
}
```

### Exemplo 2: Descriptografar e Exibir Entrada (Client-Side)

```typescript
import { descriptografarEntradaDiario, recuperarChaveCriptografia } from '@/services/crypto';

async function carregarEntradasDiario() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Busca entradas do banco
  const { data: entradas, error } = await supabase
    .from('diario_entradas')
    .select('*')
    .eq('usuario_id', user.id)
    .order('data', { ascending: false });

  if (error || !entradas) return;

  // Recupera chave do SecureStore
  const chave = await recuperarChaveCriptografia();
  if (!chave) {
    // Pedir senha novamente
    const senha = await pedirSenhaUsuario();
    const chaveNova = gerarChaveCriptografia(senha, user.id);
    await salvarChaveCriptografia(chaveNova);
  }

  // Descriptografa cada entrada
  const entradasDescriptografadas = await Promise.all(
    entradas.map(async (entrada) => {
      if (entrada.conteudo_criptografado) {
        const conteudo = await descriptografarEntradaDiario(
          entrada.conteudo_criptografado,
          user.id,
          senha
        );
        return { ...entrada, conteudo };
      }
      return entrada;
    })
  );

  setEntradas(entradasDescriptografadas);
}
```

### Exemplo 3: Armazenar Token de API (Server-Side Vault)

```typescript
// Em uma função administrativa ou durante setup
import { criarSegredoVault } from '@/services/crypto';

async function configurarIntegracaoExterna() {
  const tokenApi = 'sk_live_abc123...'; // Token real

  const segredoId = await criarSegredoVault(
    tokenApi,
    'token_servico_externo',
    'Token de API para integração com serviço de telemedicina'
  );

  console.log('Segredo criado com ID:', segredoId);
}
```

---

## Conformidade LGPD

A Lei Geral de Proteção de Dados (LGPD) exige proteção especial para **dados sensíveis**, que incluem:

- 📋 Dados de saúde (Art. 11, I)
- 🏳️‍⚧️ Dados sobre orientação sexual e identidade de gênero (Art. 5º, II)

### Requisitos para Transcend

1. **Criptografia Forte** (Art. 46, §1º):
   - ✅ Usar AES-256 ou superior
   - ✅ Chaves gerenciadas com segurança
   - ✅ Criptografia em trânsito e repouso

2. **Consentimento Explícito** (Art. 11, I):
   - ✅ Usuário deve consentir com armazenamento de dados de saúde
   - ✅ Consentimento específico por finalidade
   - ✅ Possibilidade de revogar consentimento

3. **Minimização de Dados** (Art. 6º, III):
   - ✅ Coletar apenas dados necessários
   - ✅ Não criptografar dados usados em queries (use RLS)
   - ✅ Excluir dados não mais necessários

4. **Direito ao Esquecimento** (Art. 18, VI):
   - ✅ Implementar soft delete (coluna `deleted_at`)
   - ✅ Permitir exclusão definitiva após período
   - ✅ Garantir exclusão de backups

5. **Portabilidade** (Art. 18, V):
   - ✅ Permitir exportação de dados descriptografados
   - ✅ Formato legível (JSON, PDF)

6. **Auditoria e Logs**:
   - ✅ Registrar acessos a dados sensíveis
   - ✅ Tabela `audit_acesso_dados_sensiveis`
   - ✅ Revisar logs periodicamente

### Implementar Termo de Consentimento

```typescript
// Em src/app/(public)/cadastro/pessoa-trans/cadastro-trans.tsx

const [consentimentoDados, setConsentimentoDados] = useState(false);
const [consentimentoCriptografia, setConsentimentoCriptografia] = useState(false);

// No formulário:
<View style={styles.consentimentoContainer}>
  <TouchableOpacity
    onPress={() => setConsentimentoDados(!consentimentoDados)}
    style={styles.checkboxRow}
  >
    <Ionicons
      name={consentimentoDados ? 'checkbox' : 'square-outline'}
      size={24}
      color={colors.primary}
    />
    <Text style={styles.consentimentoTexto}>
      Concordo com o armazenamento de meus dados de saúde para as
      finalidades descritas na Política de Privacidade.
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => setConsentimentoCriptografia(!consentimentoCriptografia)}
    style={styles.checkboxRow}
  >
    <Ionicons
      name={consentimentoCriptografia ? 'checkbox' : 'square-outline'}
      size={24}
      color={colors.primary}
    />
    <Text style={styles.consentimentoTexto}>
      Entendo que meus dados mais sensíveis serão criptografados e que,
      caso eu esqueça minha senha, não será possível recuperá-los.
    </Text>
  </TouchableOpacity>
</View>
```

---

## FAQ

### 1. Qual a diferença entre criptografia client-side e server-side?

- **Client-side**: Dados são criptografados no dispositivo do usuário. Nem o servidor pode lê-los.
- **Server-side**: Dados são criptografados no servidor. Administradores com acesso correto podem descriptografar.

### 2. E se o usuário esquecer a senha com criptografia client-side?

Não há recuperação. É o preço da máxima privacidade. Considere:
- Avisar claramente no onboarding
- Oferecer biometria como alternativa
- Usar server-side para dados que precisam ser recuperáveis

### 3. Criptografia não deixa o app mais lento?

Sim, há overhead, mas é mínimo com implementações modernas (AES-256 é muito rápido em hardware moderno). Faça:
- Cache de dados descriptografados em memória (com cuidado)
- Criptografar apenas dados realmente sensíveis
- Usar worker threads para criptografia pesada (se necessário)

### 4. Como migrar dados já existentes para criptografados?

```sql
-- Criar coluna nova
ALTER TABLE diario_entradas ADD COLUMN conteudo_criptografado BYTEA;

-- Script de migração (executar do app ou função PL/pgSQL)
-- Para cada entrada:
--   1. Buscar conteudo
--   2. Criptografar client-side
--   3. Salvar em conteudo_criptografado
--   4. Limpar conteudo original

-- Após migração completa:
ALTER TABLE diario_entradas DROP COLUMN conteudo;
```

### 5. Preciso criptografar arquivos/fotos também?

Sim, se forem sensíveis. Use:
- Criptografar arquivo antes de upload para Supabase Storage
- Ou usar Storage com políticas RLS estritas (mais simples, menos seguro)

```typescript
import { criptografar } from '@/services/crypto';

// Ler arquivo como base64
const arquivoBase64 = await FileSystem.readAsStringAsync(uri, {
  encoding: FileSystem.EncodingType.Base64,
});

// Criptografar
const arquivoCriptografado = await criptografar(arquivoBase64, chave);

// Upload para Storage
const { data, error } = await supabase.storage
  .from('diario-fotos-criptografadas')
  .upload(`${userId}/${fileName}.enc`, arquivoCriptografado);
```

### 6. Como fazer backup dos dados criptografados?

- **Client-side**: Usuário deve exportar e armazenar em local seguro (iCloud, Google Drive com senha)
- **Server-side (Vault)**: Supabase faz backup automático, incluindo chaves do Vault

### 7. Posso fazer busca em dados criptografados?

**Não** para criptografia simétrica (AES). Alternativas:
- Manter metadados não-criptografados (ex: data, tipo, tags)
- Usar **searchable encryption** (mais complexo, bibliotecas como CryptoSearch)
- Descriptografar localmente e filtrar no client (ok para datasets pequenos)

### 8. Como rotacionar chaves de criptografia?

```typescript
// 1. Gerar nova chave
const novaChave = gerarChaveCriptografia(novaSenha, userId);

// 2. Para cada dado criptografado:
//    - Descriptografar com chave antiga
//    - Criptografar com chave nova
//    - Salvar no banco

// 3. Atualizar chave armazenada
await salvarChaveCriptografia(novaChave);
```

---

## Recursos Adicionais

- [Supabase Vault Documentation](https://supabase.com/docs/guides/database/vault)
- [pgcrypto Extension](https://www.postgresql.org/docs/current/pgcrypto.html)
- [CryptoJS Documentation](https://cryptojs.gitbook.io/docs/)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [LGPD - Lei 13.709/2018](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

## Próximos Passos

1. ✅ Instalar `crypto-js`: `npm install crypto-js`
2. ✅ Executar `supabase-encryption-setup.sql` no Supabase
3. ✅ Atualizar `src/services/crypto.ts` com AES real
4. ✅ Implementar criptografia no diário (`diario.tsx`)
5. ✅ Adicionar termo de consentimento no cadastro
6. ✅ Testar criptografia/descriptografia end-to-end
7. ✅ Implementar auditoria de acessos
8. ✅ Revisar conformidade LGPD com advogado

---

**Dúvidas?** Consulte a equipe de desenvolvimento ou abra uma issue no repositório.

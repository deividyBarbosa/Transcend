# Transcend - Plataforma de Apoio para Pessoas Trans

<div align="center">


[![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)


**Uma plataforma digital segura e acolhedora para pessoas trans em processo de transição de gênero**

[Sobre](#-sobre) • [Funcionalidades](#-funcionalidades) • [Arquitetura](#️-arquitetura) • [Download](#-download) • [Instalação](#-instalação)
</div>

---

## 📖 Sobre

O **Transcend** é uma plataforma mobile desenvolvida para apoiar pessoas trans durante seu processo de transição de gênero, oferecendo:

- 💊 **Acompanhamento hormonal** estruturado e seguro
- 📔 **Diário de transição** para registro emocional e físico
- 🧠 **Suporte psicológico** com profissionais especializados
- 🔒 **Privacidade** e segurança de dados conforme LGPD

### Contexto

O projeto surge da necessidade de uma solução integrada que centralize cuidado da saúde física e emocional de forma segura, organizada e acessível, preenchendo lacunas deixadas por soluções fragmentadas existentes no mercado.

---

## ✨ Funcionalidades

### 💊 Terapia Hormonal
- Registro de plano hormonal prescrito
- Acompanhamento de aplicações hormonais
- Notificações automáticas de aplicação *
- Alertas de atraso nas aplicações *
- Histórico completo de aplicações

### 📔 Diário de Transição
- Agenda com registros diários de emoções e sintomas
- Registro fotográfico da evolução física *
- Marcação de eventos importantes *
- Compartilhamento seletivo com psicólogos *

### 🧠 Acompanhamento Psicológico
- Agendamento de sessões online
- Anotações privadas do psicólogo *
- Acesso ao histórico emocional (com consentimento) *
- Notificações de sessões agendadas *

*Funções em desenvolvimento* *

---

## 🏗️ Arquitetura

### Visão Geral

O Transcend segue uma arquitetura **cliente-servidor** com separação clara de responsabilidades.

### Detalhamento das Camadas

#### 1️⃣ **Frontend - React Native**


#### 2️⃣ **Backend - Supabase + PostgreSQL**

**Principais Módulos:**

- **Auth (GoTrue)**: Autenticação JWT com providers externos
- **Database (PostgreSQL)**: Armazenamento de dados com Row Level Security (RLS)
- **Storage**: Armazenamento de arquivos (fotos, documentos)
- **Realtime**: Atualizações em tempo real (chat, notificações)
- **Edge Functions**: Lógica serverless para processamentos complexos



### 🔒 Segurança (Row Level Security)

Cada tabela possui políticas RLS que garantem:
- Usuários só acessam seus próprios dados
- Psicólogos só acessam dados compartilhados
- Logs de todas as ações sensíveis

**Exemplo de RLS:**
```sql
-- Pessoas trans só veem seus próprios planos hormonais
CREATE POLICY "Users can view own hormonal plans"
ON planos_hormonais FOR SELECT
USING (auth.uid() = pessoa_trans_id);
```



### 🎨 Stack Tecnológico

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Frontend** | React Native + Expo | Cross-platform, hot reload, rico ecossistema |
| **Linguagem** | TypeScript | Type safety, melhor DX, menos bugs |
| **Navegação** | React Navigation | Padrão da comunidade, flexível |
| **Estado** | Context API + Hooks | Nativo, suficiente para o escopo |
| **Backend** | Supabase | PostgreSQL gerenciado, auth integrado, realtime |
| **Database** | PostgreSQL 17 | ACID, RLS nativo, extensível |
| **Storage** | Supabase Storage | Integrado, políticas de acesso |
| **Push** | Expo Notifications | Simplifica notificações cross-platform |
| **Analytics** | Supabase Analytics | Privacidade por design |

---

## 📲 Download

Baixe o APK mais recente para Android:

👉 **[Download do APK](https://drive.google.com/drive/u/0/folders/1cSLy0qMF2CKZv331GTJ-xx1PCnp3oKD2)**

> **Nota:** O app requer Android 8.0 ou superior. Ao instalar, pode ser necessário habilitar a opção "Instalar apps de fontes desconhecidas" nas configurações do dispositivo.

---

## 🚀 Instalação


### Setup do Projeto

```bash
# Clone o repositório
git clone https://github.com/deividyBarbosa/Transcend.git
cd transcend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# Inicie o projeto
npm start
```



## 👥 Equipe

- **Anne Gabryela Correia Lima** - Desenvolvimento
- **Deividy dos Santos Barbosa** - Desenvolvimento
- **Marina Pereira Menezes** - Desenvolvimento
- **Sara Raquel Ferreira Aragão** - Desenvolvimento

**Orientadora:** Profª Drª Adicinéia A. de Oliveira

---




# Psicologo Navigation + Scheduling (Current State)

## Overview
This document reflects the **current** navigation and scheduling flow for psicologo and pessoa trans inside `src/app/(protected)/`.

Key points:
- Shared protected routes are used by both profiles where possible.
- Consultation booking now creates a **request**.
- Psicologo must **accept** or **refuse** the request.
- Removed test artifacts (`src/__tests__`, `jest.config.js`, `jest.setup.js`).

---

## Shared Protected Routes

| Route | File | Purpose |
|---|---|---|
| `/paciente/:id` | `src/app/(protected)/paciente/[id].tsx` | Patient profile (shared) |
| `/paciente-chat/:id` | `src/app/(protected)/paciente-chat/[id].tsx` | Chat entry route (shared) |
| `/consulta/:id` | `src/app/(protected)/consulta/[id].tsx` | Generic consultation detail route |
| `/atendimentos` | `src/app/(protected)/atendimentos/index.tsx` | Shared atendimento list |
| `/editar-perfil` | `src/app/(protected)/editar-perfil.tsx` | Shared profile edit |
| `/configuracoes` | `src/app/(protected)/configuracoes.tsx` | Shared settings |

---

## Psicologo Routes

| Route | File | Purpose |
|---|---|---|
| `/psicologo/(tabs-psicologo)/home-psicologo` | `home-psicologo.tsx` | Home + pending request count + upcoming sessions |
| `/psicologo/(tabs-psicologo)/pacientes` | `pacientes.tsx` | Confirmed patients list |
| `/psicologo/(tabs-psicologo)/historico-chat` | `historico-chat.tsx` | Chat history |
| `/psicologo/(tabs-psicologo)/perfil` | `perfil.tsx` | Profile + logout + disponibilidade shortcut |
| `/psicologo/(tabs-psicologo)/solicitacoes` | `solicitacoes.tsx` | Pending consultation requests with accept/refuse |
| `/psicologo/(tabs-psicologo)/consultas/consultas` | `consultas/consultas.tsx` | Consultation list |
| `/psicologo/(tabs-psicologo)/consultas/detalhes-consulta` | `consultas/detalhes-consulta.tsx` | Consultation details |
| `/psicologo/disponibilidade` | `src/app/(protected)/psicologo/disponibilidade.tsx` | Manage weekly availability |
| `/psicologo/solicitacoes` | `src/app/(protected)/psicologo/solicitacoes.tsx` | Redirect to tab route |
| `/psicologo/atendimentos` | `src/app/(protected)/psicologo/atendimentos.tsx` | Redirect to shared atendimentos |

---

## Pessoa Trans Consultation Routes

| Route | File | Purpose |
|---|---|---|
| `/pessoa-trans/agendamento/agendar-psicologo` | `agendar-psicologo.tsx` | Choose psychologist |
| `/pessoa-trans/agendamento/agendar-consulta` | `agendar-consulta.tsx` | Choose day |
| `/pessoa-trans/agendamento/horarios-disponiveis` | `horarios-disponiveis.tsx` | Choose time and submit request |
| `/pessoa-trans/consultas` | `consultas.tsx` | Shows real sessions + status |
| `/pessoa-trans/consulta-detalhes` | `consulta-detalhes.tsx` | Detail view with DB-backed loading |

---

## Scheduling Status Flow

### 1) Request creation (pessoa trans)
- Booking from `horarios-disponiveis.tsx` creates row in `sessoes_psicologicas` with status `agendada`.
- UI message is "Solicitacao enviada".

### 2) Psicologo review
- `solicitacoes.tsx` lists only `status = agendada`.
- Actions:
  - Accept -> status becomes `confirmada`
  - Refuse -> status becomes `cancelada`

### 3) Visibility rules
- **Pessoa trans / Minhas Consultas**:
  - Pending appears as "Aguardando confirmacao do psicologo".
  - Confirmed/remarcada still shown as active consultation.
  - Cancelled moves to history.
- **Psicologo / Pacientes**:
  - Shows only patients from accepted/active history (`confirmada`, `remarcada`, `realizada`).
  - Pending requests are not treated as confirmed patients.

---

## Main Scheduling Services

Implemented in `src/services/agendamento.ts`:
- `listarSessoesPaciente`
- `listarSolicitacoesPsicologo`
- `responderSolicitacaoPsicologo`
- `listarPacientesPsicologo`
- `listarSessoesPsicologo`
- disponibilidade methods (`listar/adicionar/removerDisponibilidadeDoPsicologo`)

---

## Notes

1. `PSICOLOGO_NAVIGATION.md` is documentation only; it does not affect runtime.
2. This file intentionally reflects the current behavior after migration away from mock-only consultas/pacientes/solicitacoes screens.
3. Tests referenced in older versions of this document were removed from the repository.

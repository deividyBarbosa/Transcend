# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Transcend** is a React Native + Expo mobile app providing a safe support platform for trans people during gender transition. Features include hormone tracking, transition journaling, psychological support, and community. Primary language is **Brazilian Portuguese (pt-BR)** — all UI text, variable names in screens, and user-facing strings are in Portuguese.

## Development Commands

```bash
npm start           # Start Expo dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run on web
```

Requires Node.js >= 20.0.0. No testing, linting, or build scripts are configured yet.

## Environment Setup

Copy `.env.example` to `.env` and set:
- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_KEY` — Supabase anon/public key

## Architecture

### Tech Stack

- **React Native 0.81** with **Expo 54** (new architecture enabled)
- **TypeScript 5.9** (strict mode)
- **Expo Router 6** (file-based routing)
- **Supabase** (PostgreSQL, Auth, Storage, Realtime)
- **React 19**

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`). Use `@/services/auth` instead of `../../src/services/auth`.

### Code Organization

```
app/                          # Expo Router screens (file-based routing)
  index.tsx                   # Login screen (app entry)
  cadastro.tsx                # Registration type selection
  cadastro-trans.tsx          # Trans person registration
  cadastro-psicologo.tsx      # Psychologist registration
  cadastro-analise.tsx        # Registration pending analysis
  plano-hormonal.tsx          # Hormone plan detail
  (tabs-pessoatrans)/         # Authenticated tab navigator
    _layout.tsx               # Tab layout (4 tabs: Início, Diário, Comunidade, Perfil)
    index.tsx                 # Home/Dashboard
    diario.tsx                # Transition journal with calendar
    perfil.tsx                # Profile (stub)
    comunidade/               # Community stack navigator
      _layout.tsx             # Stack layout
      index.tsx               # Community feed
      [id].tsx                # Post detail (stub)
      novo-post.tsx           # Create post (stub)

src/
  components/                 # Reusable UI components
  database/schema.ts          # TypeScript database schema (14+ tables)
  mocks/                      # Mock data for development
  services/auth.ts            # Auth service (login, register, session management)
  theme/                      # Design tokens (colors.ts, fonts.ts)
  types/auth.ts               # Auth types (TipoUsuario, Genero, Perfil, etc.)

utils/supabase.ts             # Supabase client singleton (AsyncStorage, auto-refresh)
```

### Navigation Flow

**Unauthenticated:** `/ (login)` → `/cadastro` → `/cadastro-trans` | `/cadastro-psicologo` → `/cadastro-analise`

**Authenticated:** `/(tabs-pessoatrans)/` with 4 tabs — Home, Diário, Comunidade, Perfil

### Supabase Integration

- Client initialized in `utils/supabase.ts` with AsyncStorage for session persistence and URL detection disabled (mobile-specific)
- Auth service in `src/services/auth.ts` provides: `fazerLogin`, `cadastrarTrans`, `cadastrarPsicologo`, `fazerLogout`, `recuperarSenha`, `atualizarSenha`, `obterSessao`, `obterUsuarioAtual`, `escutarMudancasAuth`, `atualizarPerfil`, `uploadFotoPerfil`
- Portuguese error messages are mapped from Supabase error codes in the auth service

### Database Schema

Defined in `src/database/schema.ts`. Key tables: `perfis`, `psicologos`, `planos_hormonais`, `aplicacoes_hormonais`, `diario_entradas`, `diario_fotos`, `sessoes_psicologicas`, `comunidades`, `postagens`, `comentarios`, `denuncias`, `audit_log`. All tables require RLS policies with UUID primary keys and audit fields (`created_at`, `updated_at`).

### Theme

Colors in `src/theme/colors.ts` (background: `#F2E8EB`, primary: `#D65C73`). Fonts in `src/theme/fonts.ts` (Inter family). Import from `@/theme/colors` and `@/theme/fonts`.

## Git Workflow

See `BRANCHING.md` for full details. Branch from `develop`, merge via PR. Patterns: `feature/<name>`, `bugfix/<name>`, `hotfix/<version>-<description>`. Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, etc.).

## Current Development Status

**Working:** Auth flows (login, register), tab navigation, hormone plan display, journal with calendar (local state), community feed (mock data), Supabase client setup, database schema types.

**Stubs/incomplete:** Profile screen, create post, post detail, auth state persistence across app restarts, real database operations (most screens use local state or mock data).

## Key Patterns

- All Supabase access goes through `utils/supabase.ts` singleton
- Auth operations go through `src/services/auth.ts` — do not call Supabase auth directly from screens
- User types: `pessoa_trans`, `psicologo`, `moderador`, `admin` (enum `TipoUsuario`)
- Gender options: `mulher_trans`, `homem_trans`, `nao_binario`, `outro` (enum `Genero`)
- Privacy-first: respect user consent, LGPD compliance, RLS on all tables
- DismissKeyboard wrapper component in `src/components/` for form screens

## Documentation

### Core Framework
- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Backend
- [Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

### UI & Navigation
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [React Native Calendars](https://github.com/wix/react-native-calendars)
- [React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context)
- [React Native Screens](https://github.com/software-mansion/react-native-screens)

### Utilities
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Expo Document Picker](https://docs.expo.dev/versions/latest/sdk/document-picker/)
- [Expo Constants](https://docs.expo.dev/versions/latest/sdk/constants/)
- [Expo Linking](https://docs.expo.dev/versions/latest/sdk/linking/)
- [Expo Status Bar](https://docs.expo.dev/versions/latest/sdk/status-bar/)
- [React Native Picker](https://github.com/react-native-picker/picker)

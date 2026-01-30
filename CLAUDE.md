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

`@/*` maps to `src/*` (configured in `tsconfig.json`). Always use `@/services/auth` instead of relative `../../src/services/auth`.

### Code Organization

Everything lives under `src/` (including the Expo Router `app/` directory):

```
src/
  app/                                    # Expo Router screens (file-based routing)
    _layout.tsx                           # Root layout (currently commented out)
    index.tsx                             # Login screen (app entry)
    (public)/                             # Unauthenticated route group
      cadastro/
        cadastro.tsx                      # Registration type selection
        pessoa-trans/cadastro-trans.tsx    # Trans person registration
        psicologo/step1.tsx               # Psychologist registration step 1
        psicologo/step2.tsx               # Psychologist registration step 2
    (protected)/                          # Authenticated route group
      pessoa-trans/
        plano-hormonal.tsx                # Hormone plan detail
        editar-medicamento.tsx            # Edit medication
        (tabs-pessoatrans)/               # Tab navigator (Início, Diário, Comunidade, Perfil)
          _layout.tsx                     # Tab layout
          index.tsx                       # Home/Dashboard
          diario.tsx                      # Transition journal with calendar
          perfil.tsx                      # Profile (stub)
          comunidade/                     # Community stack navigator
            _layout.tsx                   # Stack layout
            index.tsx                     # Community feed
            [id].tsx                      # Post detail (stub)
            novo-post.tsx                 # Create post (stub)
  components/                             # Reusable UI components (9 components)
  database/schema.ts                      # TypeScript database schema (14+ tables)
  mocks/mockComunidade.ts                 # Mock data for community feed
  services/auth.ts                        # Auth service (login, register, session)
  theme/                                  # Design tokens
    colors.ts                             # Color palette
    fonts.ts                              # Font definitions (Inter family)
  types/auth.ts                           # Auth types (TipoUsuario, Genero, Perfil, etc.)
  utils/supabase.ts                       # Supabase client singleton
  assets/                                 # Images and icons
```

### Navigation Flow

Routes use Expo Router's group convention with `(public)` and `(protected)` route groups:

**Unauthenticated:** `/ (login)` → `/(public)/cadastro/cadastro` → `.../pessoa-trans/cadastro-trans` | `.../psicologo/step1` → `.../psicologo/step2`

**Authenticated:** `/(protected)/pessoa-trans/(tabs-pessoatrans)/` with 4 tabs — Home, Diário, Comunidade, Perfil

### Supabase Integration

- Client initialized in `src/utils/supabase.ts` with AsyncStorage for session persistence and `detectSessionInUrl: false` (required for React Native)
- Auth service in `src/services/auth.ts` provides: `fazerLogin`, `cadastrarTrans`, `cadastrarPsicologo`, `fazerLogout`, `recuperarSenha`, `atualizarSenha`, `obterSessao`, `obterUsuarioAtual`, `escutarMudancasAuth`, `atualizarPerfil`, `uploadFotoPerfil`
- Portuguese error messages are mapped from Supabase error codes via `mapearErro()` in the auth service
- All auth functions return `ResultadoAuth<T>` with `{ sucesso, dados?, erro?, codigo? }`

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

- All Supabase access goes through `src/utils/supabase.ts` singleton
- Auth operations go through `src/services/auth.ts` — do not call Supabase auth directly from screens
- User types: `pessoa_trans`, `psicologo`, `moderador`, `admin` (enum `TipoUsuario`)
- Gender options: `mulher_trans`, `homem_trans`, `nao_binario`, `outro` (enum `Genero`)
- Privacy-first: respect user consent, LGPD compliance, RLS on all tables
- `DismissKeyboard` wrapper component wraps all form screens for keyboard dismissal + `KeyboardAvoidingView`
- Screens use local `useState` for state — no external state management library
- Icons use `@expo/vector-icons` (Ionicons)

## Best Practices

### Component Structure

- Use `default export` for screen and component files — Expo Router requires default exports for route files
- Define `Props` interface directly above the component in the same file
- Place `StyleSheet.create()` at the bottom of each file, after the component
- Keep components as functional components with hooks; no class components

### Styling

- Always use `StyleSheet.create()` — never inline style objects (except for dynamic/conditional values composed from stylesheet entries)
- Import colors from `@/theme/colors` and fonts from `@/theme/fonts` — never hardcode color hex values or font family strings in screen files
- Use the existing color tokens: `background`, `primary`, `text`, `white`, `card`, `muted`, `iconBackground`. Add new tokens to `colors.ts` if needed rather than using ad-hoc hex values
- Standard spacing increments: 8, 12, 16, 20, 24. Keep spacing consistent across screens
- Use `flex: 1` on root containers. Use `ScrollView` with `contentContainerStyle` for scrollable content, `FlatList` for dynamic lists

### Navigation & Routing

- Follow Expo Router file-based routing conventions — screen file placement determines URL structure
- Use `router.push()` for forward navigation, `router.back()` for back, `router.replace()` when the user should not navigate back (e.g., after login)
- Pass route params via `router.push({ pathname, params })`, receive them with `useLocalSearchParams()`
- Route groups `(public)` and `(protected)` separate auth states — place new unauthenticated screens under `(public)`, authenticated under `(protected)`

### Supabase & Data Layer

- Never import `supabase` directly in screen files. All database queries should go through a service file in `src/services/`
- Follow the `ResultadoAuth<T>` pattern for service functions: return `{ sucesso: true, dados }` on success, `{ sucesso: false, erro }` on failure
- Map Supabase error messages to Portuguese using `mapearErro()` or similar pattern
- Always filter by `deleted_at IS NULL` for soft-deleted records
- When creating new tables, define TypeScript types in `src/database/schema.ts` and create corresponding types in `src/types/`

### Forms & User Input

- Wrap form screens with the `DismissKeyboard` component for proper keyboard handling
- Use the `Input` component from `@/components/Input` — it handles labels, error messages, and consistent styling
- Use the `Button` component from `@/components/Button` — pass `loading` prop during async operations to show ActivityIndicator and disable re-submission
- Validate inputs before submission, display validation errors through `Input`'s `error` prop or `Alert.alert()` for general messages
- Format helpers (CPF, date, CRP) should live alongside the form or in a shared `utils/` file

### State Management

- Use `useState` for component-local state and form fields
- Use `useEffect` for side effects (data fetching on mount, subscriptions)
- Avoid prop drilling more than 2 levels — if state needs to be shared widely, extract to React Context
- Keep loading/error states (`carregando`, `erro`) as separate `useState` hooks, not combined into a single object
- Prefer simple `boolean` flags for UI states (e.g., `carregando`, `mostrarFormulario`) over complex state machines

### Language & Naming

- All user-facing strings in Portuguese (pt-BR) — button labels, error messages, alerts, placeholders
- Variable and function names in screens and services follow Portuguese naming: `carregando` not `loading`, `fazerLogin` not `doLogin`, `cadastrar` not `register`
- TypeScript interface/type names use Portuguese: `Perfil`, `Usuario`, `ResultadoAuth`, `DadosCadastroTrans`
- Component file names use PascalCase English (`Button.tsx`, `Header.tsx`)
- Screen file names use kebab-case Portuguese matching the route (`plano-hormonal.tsx`, `editar-medicamento.tsx`)

### Performance

- Use `FlatList` for rendering lists of items (not `ScrollView` with `.map()`) — this matters for community feeds and any list that can grow
- Avoid creating new function/object references in render — define callbacks outside JSX or use `useCallback` for functions passed as props to child components that could re-render
- Prefer `Pressable` or `TouchableOpacity` with `activeOpacity={0.7}` for consistent press feedback

### New Features Checklist

When adding a new screen or feature:
1. Create the screen file under the appropriate route group (`(public)` or `(protected)`)
2. Create or extend a service file in `src/services/` for any Supabase operations
3. Add TypeScript types to `src/types/` or `src/database/schema.ts`
4. Use existing shared components (`Button`, `Input`, `Header`, `DismissKeyboard`) before creating new ones
5. Follow the established screen structure: `DismissKeyboard` → `Header` → `ScrollView` → content → actions

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
- [React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context)
- [React Native Screens](https://github.com/software-mansion/react-native-screens)

### Utilities
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Expo Document Picker](https://docs.expo.dev/versions/latest/sdk/document-picker/)
- [Expo Constants](https://docs.expo.dev/versions/latest/sdk/constants/)
- [Expo Linking](https://docs.expo.dev/versions/latest/sdk/linking/)
- [Expo Status Bar](https://docs.expo.dev/versions/latest/sdk/status-bar/)
- [React Native Picker](https://github.com/react-native-picker/picker)

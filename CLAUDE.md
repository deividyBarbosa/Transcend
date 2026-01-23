# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Transcend** is a React Native + Expo mobile app providing a safe support platform for trans people during gender transition, offering hormone tracking, transition journaling, psychological support, and community features.

## Development Commands

```bash
# Start development server
npm start

# Run on specific platforms
npm run android
npm run ios
npm run web
```

**Note:** This project is in early development. Testing, linting, and build scripts are not yet configured.

## Environment Setup

Required environment variables in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_KEY` - Supabase anon/public key

Copy `.env.example` to `.env` and configure with Supabase credentials.

## Architecture

### Technology Stack

- **Frontend:** React Native with Expo (new architecture enabled)
- **Language:** TypeScript (strict mode)
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management:** Context API + React Hooks (planned)
- **Navigation:** React Navigation (planned)
- **Push Notifications:** Expo Notifications (planned)

### Client-Server Architecture

The app follows a clean separation between client (React Native) and server (Supabase):

**Frontend responsibilities:**
- UI/UX rendering
- Local state management
- Form validation
- Offline-first data caching (planned)

**Backend (Supabase) responsibilities:**
- Authentication (JWT, OAuth providers)
- Database operations (PostgreSQL with Row Level Security)
- File storage (images, documents)
- Real-time updates (chat, notifications)
- Serverless functions (Edge Functions for complex logic)

### Supabase Client Configuration

The Supabase client is initialized in `utils/supabase.ts` with:
- AsyncStorage for session persistence
- Auto token refresh enabled
- URL detection disabled (mobile-specific)

### Security & Data Protection

**Row Level Security (RLS):** All database tables must implement RLS policies ensuring:
- Users access only their own data
- Psychologists access only shared/consented data
- Moderators have scoped community access
- All sensitive operations are logged

**Compliance:**
- LGPD-compliant (Brazilian data protection law)
- Encryption: AES-256 at rest, TLS 1.3 in transit
- 2FA support (TOTP/SMS)
- Biometric authentication (Touch ID/Face ID)
- Audit logging for sensitive operations

## Planned Core Features

### 1. Hormone Therapy Tracking
- Hormone plan registration (prescribed by professionals)
- Application tracking and history
- Automated notifications and delay alerts
- Full therapy timeline

### 2. Transition Journal
- Daily emotion and symptom tracking
- Photo documentation of physical changes
- Important milestone marking
- Session history (scheduled and completed)
- Selective sharing with psychologists (with consent)

### 3. Psychological Support
- Online session scheduling
- Private psychologist notes
- Emotional history access (consent-based)
- Session notifications
- Emotional evolution reports

### 4. Community
- Themed, moderated communities
- Posts and comments (with anonymity option)
- Like and report system
- Active moderation against inappropriate content
- Community-based filtering

## Database Schema Principles

When creating or modifying database tables:

1. **Always implement RLS policies** - Never create tables without appropriate RLS
2. **Use UUIDs for primary keys** - Follow PostgreSQL best practices
3. **Add audit fields** - `created_at`, `updated_at`, `created_by` for sensitive tables
4. **Foreign key constraints** - Maintain referential integrity
5. **Indexes on foreign keys** - Optimize queries
6. **Use appropriate data types** - JSONB for flexible data, proper date/time types

## Code Organization

Current structure (early stage):
```
/app          - Future app screens and routes
/utils        - Shared utilities (Supabase client)
/assets       - Images, fonts, icons
App.tsx       - Root component
index.ts      - Expo entry point
```

Expected future structure:
```
/app
  /(tabs)     - Tab navigation routes
  /auth       - Authentication screens
  /profile    - User profile
  /journal    - Transition journal
  /therapy    - Hormone therapy tracking
  /community  - Community features
/components   - Reusable UI components
/contexts     - React Context providers
/hooks        - Custom React hooks
/services     - API/Supabase service layer
/types        - TypeScript type definitions
/utils        - Utilities and helpers
```

## Key Implementation Patterns

### Supabase Data Fetching
Always use the centralized Supabase client from `utils/supabase.ts`. Handle auth state and errors consistently.

### State Management
Use Context API for global state (auth, user profile, theme). Keep component-local state minimal.

### Type Safety
TypeScript strict mode is enabled. Always type Supabase responses and avoid `any`.

### Sensitive Data
Never store sensitive data (API keys, tokens, personal health data) in code or commits. Use environment variables and Supabase's built-in security.

## Navigation Structure (Planned)

- Unauthenticated: Login → Register → Password Recovery
- Authenticated (Tabs):
  - Home/Dashboard
  - Hormone Therapy
  - Transition Journal
  - Psychological Support
  - Community
  - Profile/Settings

## Important Notes

- **Privacy-first design:** All features must respect user consent and data minimization
- **Accessibility:** Follow WCAG guidelines for inclusive design
- **Portuguese language:** Primary language is Brazilian Portuguese (pt-BR)
- **Offline support:** Plan for offline-first architecture where feasible
- **Performance:** Optimize for low-end devices and poor network conditions

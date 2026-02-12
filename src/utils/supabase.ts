import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

const isRefreshTokenInvalido = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const authError = error as { message?: string; code?: string };
  const mensagem = authError.message || '';
  const codigo = authError.code || '';

  return /invalid refresh token|refresh token not found/i.test(mensagem)
    || codigo === 'refresh_token_not_found';
};

const limparSessaoCorrompida = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.getSession();

    if (isRefreshTokenInvalido(error)) {
      console.warn('[supabase] sessao invalida detectada; limpando sessao local...');
      await supabase.auth.signOut({ scope: 'local' });
    }
  } catch (e) {
    if (isRefreshTokenInvalido(e)) {
      await supabase.auth.signOut({ scope: 'local' });
      return;
    }

    console.warn('[supabase] erro ao validar sessao inicial', e);
  }
};

void limparSessaoCorrompida();

// Debug: log auth state changes and inspect AsyncStorage keys containing auth info
supabase.auth.onAuthStateChange(async (event, session) => {
  try {
    console.log('[supabase] auth event:', event);
    console.log('[supabase] session:', session ? { user: session.user?.id, accessToken: !!session.access_token, refreshToken: !!session.refresh_token, expires_at: session.expires_at } : null);

    const keys = await AsyncStorage.getAllKeys();
    const interesting = keys.filter(k => /supabase|sb|auth/i.test(k));
    for (const k of interesting) {
      const v = await AsyncStorage.getItem(k);
      console.log('[supabase][storage] key:', k, 'valuePreview:', v ? v.slice(0, 250) : null);
    }
  } catch (e) {
    console.warn('[supabase] error inspecting AsyncStorage', e);
  }
});

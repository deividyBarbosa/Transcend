import { useRouter } from 'expo-router';
import { useEffect } from 'react';

// Redirect to shared atendimentos route
export default function AtendimentosRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('../atendimentos');
  }, [router]);

  return null;
}

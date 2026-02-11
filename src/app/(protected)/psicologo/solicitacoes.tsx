import { useRouter } from 'expo-router';
import { useEffect } from 'react';

// Redirect to shared solicitacoes route (or create one if needed)
export default function SolicitacoesRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('(tabs-psicologo)/solicitacoes');
  }, [router]);

  return null;
}

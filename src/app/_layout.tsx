import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RootLayout() {

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >
        {/* Tela de login (raiz) */}
        <Stack.Screen 
          name="index"
          options={{
            animation: 'fade',
          }}
        />
        
        {/* Pasta (public) - cadastros */}
        <Stack.Screen 
          name="(public)"
          options={{
            animation: 'slide_from_right',
          }}
        />
        
        {/* Pasta (protected) - área autenticada */}
        <Stack.Screen 
          name="(protected)"
          options={{
            animation: 'fade',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
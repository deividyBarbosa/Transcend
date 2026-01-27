// teste. tentando colocar TRANSições entre telas. deu errado.

// import { Stack } from 'expo-router';

// export default function RootLayout() {
//   return (
//     <Stack
//       screenOptions={{
//         headerShown: false,
//         animation: 'slide_from_right',
//         animationDuration: 300,
//       }}
//     >

//       <Stack.Screen 
//         name="index"
//         options={{
//           animation: 'fade',
//         }}
//       />
      
//       <Stack.Screen name="cadastro" />
//       <Stack.Screen name="cadastro-trans" />
//       <Stack.Screen name="cadastro-psicologo" />
//       <Stack.Screen name="cadastro-analise" />
//       <Stack.Screen name="confirmacao-email" />
      
//       <Stack.Screen 
//         name="(tabs-pessoatrans)"
//         options={{
//           animation: 'fade',
//         }}
//       />
      
//       <Stack.Screen name="plano-hormonal" />
//       <Stack.Screen name="editar-medicamento" />
//       <Stack.Screen name="inicio" />
//     </Stack>
//   );
// }
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
            height: 60 + insets.bottom,
            paddingBottom: 8 + insets.bottom,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Inter-Medium',
          },
        }}
          >
          <Tabs.Screen
          name="index"
          options={{
              title: 'Início',
              tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
              ),
          }}
          />
          <Tabs.Screen
          name="diario"
          options={{
              title: 'Diário',
              tabBarIcon: ({ color, size }) => (
              <Ionicons name="book-outline" size={size} color={color} />
              ),
          }}
          />
          <Tabs.Screen
          name="perfil"
          options={{
              title: 'Perfil',
              tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
              ),
          }}
          />
      </Tabs>
    </SafeAreaView>
  );
}

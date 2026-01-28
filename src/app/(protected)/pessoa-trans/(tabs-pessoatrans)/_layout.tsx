import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
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
        name="comunidade"
        options={{
            title: 'Comunidade',
            tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
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
  );
}

function TabIcon({ name }: { name: string }) {
  return <Text style={{ fontSize: 24 }}>{name}</Text>;
}
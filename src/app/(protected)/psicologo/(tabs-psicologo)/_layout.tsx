import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "@/theme/colors";
import { Ionicons, Entypo } from "@expo/vector-icons";

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
          borderTopColor: "#E0E0E0",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Inter-Medium",
        },
      }}
    >
      <Tabs.Screen
        name="home-psicologo"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pacientes"
        options={{
          title: "Pacientes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="transgender" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="historico-chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Entypo name="chat" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="solicitacoes"
        options={{
          href: null, 
          title: "Solicitações",
        }}
      />
      <Tabs.Screen
        name="consultas/consultas"
        options={{
          href: null,

        }}
      />
      <Tabs.Screen
        name="consultas/detalhes-consulta"
        options={{
          href: null, 
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name }: { name: string }) {
  return <Text style={{ fontSize: 24 }}>{name}</Text>;
}
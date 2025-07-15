import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './theme';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopWidth: 1,
          borderTopColor: theme.colors.gray[200],
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
          paddingHorizontal: 20,
        },
        headerStyle: {
          backgroundColor: theme.colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.gray[200],
        },
        headerTitleStyle: {
          fontSize: theme.typography.h3.fontSize,
          fontWeight: '600',
          color: theme.colors.text,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray[400],
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingHorizontal: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Voz Clara',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pictogramas"
        options={{
          title: 'Pictogramas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="images" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camara"
        options={{
          title: 'Cámara',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ayuda"
        options={{
          title: 'Ayuda',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 

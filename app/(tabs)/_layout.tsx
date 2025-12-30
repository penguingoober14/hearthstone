import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

// Color palette from design doc
const colors = {
  hearthOrange: '#E85D04',
  charcoal: '#2D3436',
  cream: '#FDF6E3',
  sageGreen: '#52796F',
  inactive: '#9CA3AF',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: '🏠',
    dashboard: '📊',
    inventory: '🧊',
    prep: '📅',
    quest: '🏆',
  };

  return (
    <Text style={[styles.icon, { opacity: focused ? 1 : 0.5 }]}>
      {icons[name] || '•'}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.hearthOrange,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.cream,
          borderTopColor: '#E5E7EB',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tonight',
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon name="dashboard" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ focused }) => <TabIcon name="inventory" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="prep"
        options={{
          title: 'Prep',
          tabBarIcon: ({ focused }) => <TabIcon name="prep" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="quest"
        options={{
          title: 'Quest',
          tabBarIcon: ({ focused }) => <TabIcon name="quest" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 24,
  },
});

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Color palette from design doc
const colors = {
  hearthOrange: '#E85D04',
  charcoal: '#2D3436',
  cream: '#FDF6E3',
  sageGreen: '#52796F',
  inactive: '#9CA3AF',
};

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  index: { active: 'flame', inactive: 'flame-outline' },
  dashboard: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  inventory: { active: 'cube', inactive: 'cube-outline' },
  prep: { active: 'calendar', inactive: 'calendar-outline' },
  quest: { active: 'trophy', inactive: 'trophy-outline' },
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const iconSet = TAB_ICONS[name] || { active: 'ellipse', inactive: 'ellipse-outline' };
  const iconName = focused ? iconSet.active : iconSet.inactive;
  const color = focused ? colors.hearthOrange : colors.inactive;

  return (
    <Ionicons
      name={iconName}
      size={24}
      color={color}
      accessibilityLabel={`${name} tab`}
    />
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

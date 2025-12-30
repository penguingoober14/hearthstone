import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../lib/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'highlight' | 'urgent' | 'muted';
  style?: ViewStyle;
}

export function Card({ children, variant = 'default', style }: CardProps) {
  return (
    <View style={[styles.card, variantStyles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});

const variantStyles = StyleSheet.create({
  default: {},
  highlight: {
    backgroundColor: colors.hearthOrange,
  },
  urgent: {
    backgroundColor: 'rgba(214, 40, 40, 0.1)',
    borderWidth: 1,
    borderColor: colors.softRed,
  },
  muted: {
    backgroundColor: 'rgba(82, 121, 111, 0.1)',
    shadowOpacity: 0,
    elevation: 0,
  },
});

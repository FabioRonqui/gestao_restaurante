// esse arquivo é o componente de barra de navegação inferior.

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

type TabRoute = '/' | '/products' | '/orders';

type Tab = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  route?: TabRoute;
};

const tabs: Tab[] = [
  { label: 'Home', icon: 'home', route: '/' },
  { label: 'Cardápio', icon: 'flag', route: '/products' },
  { label: 'Favorites', icon: 'heart' },
  { label: 'Orders', icon: 'file-text', route: '/orders' },
  { label: 'Support', icon: 'headphones' },
];

type Props = {
  activeTab: string;
};

export default function OrdersTabBar({ activeTab }: Props) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = tab.label === activeTab;

        return (
          <Pressable
            key={tab.label}
            style={styles.tab}
            onPress={() => {
              if (!active && tab.route) {
                router.navigate(tab.route);
              }
            }}
            disabled={!tab.route || active}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{
              selected: active,
              disabled: !tab.route || active,
            }}
          >
            <Feather
              name={tab.icon}
              size={23}
              color={active ? '#FFFFFF' : '#FFD3C2'}
            />

            <Text style={[styles.label, active && styles.activeLabel]}>
              {tab.label}
            </Text>

          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    backgroundColor: '#F4511E',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    color: '#FFD3C2',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

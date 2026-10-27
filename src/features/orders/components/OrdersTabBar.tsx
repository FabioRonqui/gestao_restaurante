// Essa é barra inferior da nossa tela e que tambem permite a navegaçao do nosso app
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type Tab = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: '/' | '/orders';
};

const tabs: Tab[] = [
  { label: 'Home', icon: 'home-outline', route: '/' },
  { label: 'Search', icon: 'search-outline', route: '/' },
  { label: 'Orders', icon: 'receipt-outline', route: '/orders' },
  { label: 'Profile', icon: 'person-outline', route: '/' },
];

type Props = {
  activeTab?: string;
};

export default function OrdersTabBar({
  activeTab = 'Orders',
}: Props) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = tab.label === activeTab;

        return (
          <Pressable
            key={tab.label}
            style={styles.tab}
            onPress={() => {
              if (!active) {
                router.push(tab.route);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
          >
            <Ionicons
              name={active ? 'receipt' : tab.icon}
              size={23}
              color={active ? '#F4511E' : '#40231F'}
            />

            <Text
              style={[
                styles.label,
                active && styles.activeLabel,
              ]}
            >
              {tab.label}
            </Text>

            {active && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F7F6F6',
    borderTopWidth: 1,
    borderTopColor: '#FFD3C2',
    paddingHorizontal: 8,
    paddingBottom: 6,
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
    color: '#40231F',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#F4511E',
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 22,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#F4511E',
  },
});

import { Tabs, usePathname } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OrdersTabBar from '../features/orders/components/OrdersTabBar';

export default function Layout() {
  const pathname = usePathname();

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => {
          const currentRoute = props.state.routes[props.state.index].name;

          if (currentRoute === 'index' || currentRoute === '(auth)') {
            return null;
          }

          const activeTab = pathname.startsWith('/orders') ? 'Pedidos' : 'Home';
          return <OrdersTabBar activeTab={activeTab} />;
        }}
      >
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="(auth)" options={{ href: null }} />
        <Tabs.Screen name="products" />
        <Tabs.Screen name="orders" />
      </Tabs>
    </SafeAreaProvider>
  );
}

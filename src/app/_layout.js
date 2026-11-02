
import { Tabs, usePathname } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OrdersTabBar from '../features/orders/components/OrdersTabBar';

export default function Layout() {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname.startsWith('/orders')) {
      return 'Orders';
    }

        if (pathname.startsWith('/products')) {
      return 'Cardápio';
    }

    return 'Home';
  };

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => {
          const currentRoute =
            props.state.routes[props.state.index].name;

          // Não exibe o menu nas telas Welcome e autenticação.
        if (currentRoute === 'index' || currentRoute === '(auth)') {
          return null;
        }

          return <OrdersTabBar activeTab={getActiveTab()} />;
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

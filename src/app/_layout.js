
import { Tabs, usePathname } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CartProvider } from '../features/cart/CartContext';
import OrdersTabBar from '../features/orders/components/OrdersTabBar';

export default function Layout() {
  // Captura a rota atual do aplicativo em tempo real (ex: '/', '/orders', '/products')
  const pathname = usePathname();

  // Função que define qual aba está ativa com base na URL atual para passar ao componente visual
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
      <CartProvider>
        <Tabs
          screenOptions={{ headerShown: false }}
          tabBar={(props) => {
            const currentRoute = props.state.routes[props.state.index].name;

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
      </CartProvider>
    </SafeAreaProvider>
  );
}

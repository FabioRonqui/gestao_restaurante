import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { mockProducts } from '../../features/products/data/mockProducts';
import ProductTable from '../../features/products/components/ProductTable';
import OrdersTabBar from '../../features/orders/components/OrdersTabBar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Barra superior fixa amarela limpa */}
        <View style={styles.header}>
          {/* Mantido estritamente o título principal em branco */}
          <Text style={styles.title}>Pedidos</Text>
        </View>

        {/* Quadro central com as bordas arredondadas e fundo creme */}
        <View style={styles.productsPanel}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.productsScroll}
            contentContainerStyle={styles.content}
          >
            {mockProducts.length > 0 ? (
              <ProductTable products={mockProducts} />
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
                <Text style={styles.emptyText}>Os produtos aparecerão aqui.</Text>
              </View>
            )}
          </ScrollView>
          
          {/* Menu inferior */}
          <OrdersTabBar activeTab="Pedidos" />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFD43A', // Mantém o topo do dispositivo em amarelo
  },
  container: {
    flex: 1,
    backgroundColor: '#FFD43A', // Fundo amarelo da barra superior
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 48, // Espaço confortável para a sobreposição da borda arredondada
    alignItems: 'center', // Centraliza o título horizontalmente
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF', // Texto "Produtos" configurado estritamente em branco
  },
  productsPanel: {
    flex: 1,
    backgroundColor: '#FFF9F1', // Mantém o fundo creme original
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
    marginTop: -24, // Sobe o painel para revelar o desenho arredondado no topo
    zIndex: 1,
    elevation: 1,
  },
  productsScroll: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  empty: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
  },
  emptyText: {
    marginTop: 8,
    color: '#777777',
  },
});

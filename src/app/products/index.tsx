// Tela "Produtos" do restaurante Delícias Rápidas.
// Rota /products: consulta os pratos pela API e mantém a seleção compartilhada
// com a tela Pedidos, sem armazenar dados de demonstração no cardápio.
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { theme } from '../../constants/theme';
import { useCart } from '../../features/cart/CartContext';
import { formatPrice } from '../../features/products/utils/formatPrice';
import ProductTable from '../../features/products/components/ProductTable';
import { getProducts } from '../../features/products/services/productService';
import type { Product } from '../../features/products/types/product';
import OrdersHeader from '../../features/orders/components/OrdersHeader';

export default function ProductsScreen() {
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const {
    items: cartItems,
    itemCount,
    addProduct,
    setSelectedTableNumber,
  } = useCart();
  const { tableNumber } = useLocalSearchParams<{ tableNumber?: string }>();

  useEffect(() => {
    const parsedTableNumber = Number(tableNumber);
    if (Number.isSafeInteger(parsedTableNumber) && parsedTableNumber > 0) {
      setSelectedTableNumber(parsedTableNumber);
    }
  }, [setSelectedTableNumber, tableNumber]);

  // Recarrega o cardápio do MySQL pela API; erros são mostrados na própria tela.
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProducts(await getProducts());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar o cardápio.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  // A busca é local sobre os produtos já carregados do backend.
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchText.toLowerCase()),
  );
  const selectedQuantities: Record<number, number> = {};
  let subtotalCents = 0;
  cartItems.forEach(({ product, quantity }) => {
    selectedQuantities[product.id] = quantity;
    subtotalCents += product.priceCents * quantity;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <OrdersHeader
          title="Cardápio"
          searchText={searchText}
          onChangeSearch={setSearchText}
        />

        <View style={styles.productsPanel}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.header}>
              <Text style={styles.restaurant}>Delícias Rápidas</Text>
              <Text style={styles.title}>Produtos</Text>
              <Text style={styles.subtitle}>
                {loading
                  ? 'Carregando cardápio...'
                  : filteredProducts.length === 1
                    ? '1 produto no cardápio.'
                    : `${filteredProducts.length} produtos no cardápio.`}
              </Text>
            </View>

            {itemCount > 0 && (
              <View style={styles.cartSummary}>
                <View>
                  <Text style={styles.cartTitle}>Seu pedido</Text>
                  <Text style={styles.cartDetails}>
                    {itemCount} {itemCount === 1 ? 'item' : 'itens'} selecionados
                  </Text>
                </View>
                <Text style={styles.cartTotal}>{formatPrice(subtotalCents)}</Text>
              </View>
            )}

            {loading ? (
              <Text style={styles.message}>Carregando produtos...</Text>
            ) : error ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>
                  Não foi possível carregar o cardápio
                </Text>
                <Text style={styles.emptyText}>{error}</Text>
                <Pressable
                  style={styles.retryButton}
                  onPress={() => void loadProducts()}
                >
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              </View>
            ) : filteredProducts.length > 0 ? (
              <ProductTable
                products={filteredProducts}
                onAddProduct={addProduct}
                selectedQuantities={selectedQuantities}
              />
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
                <Text style={styles.emptyText}>Tente buscar por outro termo.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8CF58',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8CF58',
  },
  productsPanel: {
    flex: 1,
    backgroundColor: '#FFF9F1',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
    marginTop: 12,
  },
  content: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 22,
  },
  cartSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 16,
    marginBottom: 18,
  },
  cartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#242424',
  },
  cartDetails: {
    marginTop: 4,
    fontSize: 13,
    color: '#777777',
  },
  cartTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F04B1D',
  },
  restaurant: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#222222',
  },
  subtitle: {
    marginTop: 8,
    color: '#777777',
    fontSize: 14,
  },
  empty: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    color: '#777777',
    textAlign: 'center',
  },
  message: {
    color: '#777777',
    textAlign: 'center',
    padding: 28,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

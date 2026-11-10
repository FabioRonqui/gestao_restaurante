// Tela "Produtos" do restaurante Delícias Rápidas.
// Fica acessível na rota /products (o expo-router cria a rota pelo nome da pasta).
// Visual igual ao da tela de pedidos: fundo creme, título grande e conteúdo em branco.
<<<<<<< HEAD
import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../constants/theme';
import { useCart } from '../../features/cart/CartContext';
=======
import { useState } from 'react';
import { Alert, Modal, Pressable, View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../constants/theme';
import { mockProducts, restaurantName } from '../../features/products/data/mockProducts';
import { formatPrice } from '../../features/products/utils/formatPrice';
>>>>>>> 6f2239183ade019a394e8baa28e54ff89f204da4
import ProductTable from '../../features/products/components/ProductTable';
import { getProducts } from '../../features/products/services/productService';
import type { Product } from '../../features/products/types/product';
import OrdersHeader from '../../features/orders/components/OrdersHeader';

export default function ProductsScreen() {
  const [searchText, setSearchText] = useState('');
<<<<<<< HEAD
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { items: cartItems, addProduct } = useCart();

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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchText.toLowerCase()),
  );
  const selectedQuantities: Record<number, number> = {};
  cartItems.forEach(({ product, quantity }) => {
    selectedQuantities[product.id] = quantity;
  });
=======
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const filteredProducts = mockProducts.filter((product) =>
    product.name?.toLowerCase().includes(searchText.toLowerCase()),
  );
  const selectedProducts = mockProducts.filter((product) => (quantities[product.id] ?? 0) > 0);
  const itemCount = mockProducts.reduce(
    (total, product) => total + (quantities[product.id] ?? 0),
    0,
  );
  const subtotalCents = mockProducts.reduce(
    (total, product) => total + product.priceCents * (quantities[product.id] ?? 0),
    0,
  );
>>>>>>> 6f2239183ade019a394e8baa28e54ff89f204da4

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

<<<<<<< HEAD
            {loading ? (
              <Text style={styles.message}>Carregando produtos...</Text>
            ) : error ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Não foi possível carregar o cardápio</Text>
                <Text style={styles.emptyText}>{error}</Text>
                <Pressable style={styles.retryButton} onPress={() => void loadProducts()}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              </View>
            ) : filteredProducts.length > 0 ? (
              <ProductTable
                products={filteredProducts}
                onAddProduct={addProduct}
                selectedQuantities={selectedQuantities}
=======
            <View style={styles.cartSummary}>
              <View>
                <Text style={styles.cartTitle}>Seu pedido</Text>
                <Text style={styles.cartDetails}>
                  {itemCount === 0
                    ? 'Adicione produtos para começar.'
                    : `${itemCount} ${itemCount === 1 ? 'item' : 'itens'} adicionados`}
                </Text>
              </View>
              <Text style={styles.cartTotal}>{formatPrice(subtotalCents)}</Text>
            </View>

            {filteredProducts.length > 0 ? (
              <ProductTable
                products={filteredProducts}
                quantities={quantities}
                onChangeQuantity={(productId, change) =>
                  setQuantities((current) => ({
                    ...current,
                    [productId]: Math.max(0, (current[productId] ?? 0) + change),
                  }))
                }
>>>>>>> 6f2239183ade019a394e8baa28e54ff89f204da4
              />
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
                <Text style={styles.emptyText}>Tente buscar por outro termo.</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.orderFooter}>
            <View>
              <Text style={styles.footerDetails}>
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </Text>
              <Text style={styles.footerTotal}>{formatPrice(subtotalCents)}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsConfirmationVisible(true)}
              disabled={itemCount === 0}
              style={[styles.sendButton, itemCount === 0 && styles.sendButtonDisabled]}
            >
              <Text style={styles.sendButtonText}>Enviar pedido</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isConfirmationVisible}
        onRequestClose={() => setIsConfirmationVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirmar pedido</Text>
            <Text style={styles.modalSubtitle}>Confira os itens antes de continuar:</Text>

            <ScrollView style={styles.modalItems} showsVerticalScrollIndicator={false}>
              {selectedProducts.map((product) => (
                <View key={product.id} style={styles.modalItem}>
                  <Text style={styles.modalItemName}>
                    {quantities[product.id]}x {product.name}
                  </Text>
                  <Text style={styles.modalItemPrice}>
                    {formatPrice(product.priceCents * (quantities[product.id] ?? 0))}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalTotalRow}>
              <Text style={styles.modalTotalLabel}>Total</Text>
              <Text style={styles.modalTotal}>{formatPrice(subtotalCents)}</Text>
            </View>
            <Text style={styles.demoNotice}>
              Demonstração: esta tela ainda não está conectada ao sistema da cozinha.
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsConfirmationVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Voltar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setIsConfirmationVisible(false);
                  Alert.alert(
                    'Pedido não enviado',
                    'A integração com o sistema da cozinha ainda precisa ser implementada.',
                  );
                }}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    maxWidth: 1100, // em telas muito grandes, o conteúdo não se espalha demais
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
  },
  emptyText: {
    marginTop: 8,
    color: '#777777',
  },
<<<<<<< HEAD
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
=======
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  footerDetails: {
    color: '#777777',
    fontSize: 12,
  },
  footerTotal: {
    marginTop: 2,
    color: '#242424',
    fontSize: 16,
    fontWeight: '700',
  },
  sendButton: {
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F04B1D',
    borderRadius: 24,
    paddingHorizontal: 22,
  },
  sendButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
  },
  modalTitle: {
    color: '#242424',
    fontSize: 20,
    fontWeight: '800',
  },
  modalSubtitle: {
    marginTop: 6,
    color: '#777777',
    fontSize: 14,
  },
  modalItems: {
    marginTop: 16,
    flexGrow: 0,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalItemName: {
    flex: 1,
    color: '#242424',
    fontSize: 14,
  },
  modalItemPrice: {
    color: '#242424',
    fontSize: 14,
    fontWeight: '600',
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
  },
  modalTotalLabel: {
    color: '#242424',
    fontSize: 15,
    fontWeight: '700',
  },
  modalTotal: {
    color: '#F04B1D',
    fontSize: 16,
    fontWeight: '800',
  },
  demoNotice: {
    marginTop: 12,
    color: '#777777',
    fontSize: 12,
    lineHeight: 17,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    minHeight: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 18,
    backgroundColor: '#F2F2F2',
  },
  cancelButtonText: {
    color: '#555555',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmButton: {
    minHeight: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 18,
    backgroundColor: '#F04B1D',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
>>>>>>> 6f2239183ade019a394e8baa28e54ff89f204da4
    fontWeight: '700',
  },
});

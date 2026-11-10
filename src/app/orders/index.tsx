import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCart } from '../../features/cart/CartContext';
import { theme } from '../../constants/theme';
import { createOrder, getOrders } from '../../features/orders/services/orderService';
import type { Order } from '../../features/orders/types/order';
import { orderStatusLabels } from '../../features/orders/utils/orderStatus';
import { formatPrice } from '../../features/products/utils/formatPrice';
import OrdersHeader from '../../features/orders/components/OrdersHeader';

const CONFIRMATION_MESSAGE =
  'Pedido confirmado, dentro de alguns instantes seu prato será entregue à mesa, bom apetite!!';

export default function OrdersScreen() {
  const { items, setQuantity, removeProduct, clearCart } = useCart();
  const [tableNumber, setTableNumber] = useState('1');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((error: unknown) => {
        setOrdersError(
          error instanceof Error ? error.message : 'Não foi possível carregar os pedidos.',
        );
      })
      .finally(() => setLoadingOrders(false));
  }, []);

  const totalCents = items.reduce(
    (total, item) => total + item.product.priceCents * item.quantity,
    0,
  );

  async function confirmOrder() {
    const parsedTableNumber = Number(tableNumber);
    if (!Number.isInteger(parsedTableNumber) || parsedTableNumber < 1) {
      Alert.alert('Mesa inválida', 'Informe o número da mesa para continuar.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Pedido vazio', 'Adicione ao menos um prato do cardápio.');
      return;
    }

    setSubmitting(true);
    setConfirmationMessage('');
    try {
      const order = await createOrder({
        tableNumber: parsedTableNumber,
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        })),
      });
      setOrders((current) => [order, ...current]);
      clearCart();
      setConfirmationMessage(CONFIRMATION_MESSAGE);
      Alert.alert('Pedido confirmado', CONFIRMATION_MESSAGE);
    } catch (error) {
      Alert.alert(
        'Não foi possível confirmar',
        error instanceof Error ? error.message : 'Tente novamente em instantes.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <OrdersHeader title="Pedidos" showSearch={false} />
        <View style={styles.panel}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.heading}>Seu pedido</Text>
            <Text style={styles.subtitle}>
              Ajuste as quantidades ou confirme para enviar à cozinha.
            </Text>

            {confirmationMessage ? (
              <Text accessibilityRole="alert" style={styles.successMessage}>
                {confirmationMessage}
              </Text>
            ) : null}

            {items.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Nenhum prato selecionado</Text>
                <Text style={styles.subtitle}>
                  Acesse o cardápio e toque em “Adicionar ao pedido”.
                </Text>
              </View>
            ) : (
              <>
                {items.map(({ product, quantity }) => (
                  <View key={product.id} style={styles.cartItem}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.itemPrice}>
                        {formatPrice(product.priceCents)} cada
                      </Text>
                      <Text style={styles.itemSubtotal}>
                        Subtotal: {formatPrice(product.priceCents * quantity)}
                      </Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <Pressable
                        accessibilityLabel={`Diminuir quantidade de ${product.name}`}
                        style={styles.quantityButton}
                        onPress={() => setQuantity(product.id, quantity - 1)}
                      >
                        <Text style={styles.quantityButtonText}>−</Text>
                      </Pressable>
                      <Text style={styles.quantity}>{quantity}x</Text>
                      <Pressable
                        accessibilityLabel={`Aumentar quantidade de ${product.name}`}
                        style={styles.quantityButton}
                        onPress={() => setQuantity(product.id, quantity + 1)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remover ${product.name} do pedido`}
                        onPress={() => removeProduct(product.id)}
                      >
                        <Text style={styles.removeText}>Remover</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}

                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Número da mesa</Text>
                  <TextInput
                    accessibilityLabel="Número da mesa"
                    keyboardType="number-pad"
                    value={tableNumber}
                    onChangeText={setTableNumber}
                    style={styles.tableInput}
                  />
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalPrice}>{formatPrice(totalCents)}</Text>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={submitting}
                    style={[styles.cancelButton, submitting && styles.disabledButton]}
                    onPress={clearCart}
                  >
                    <Text style={styles.cancelText}>Cancelar pedido</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={submitting}
                    style={[styles.confirmButton, submitting && styles.disabledButton]}
                    onPress={() => void confirmOrder()}
                  >
                    <Text style={styles.confirmText}>
                      {submitting ? 'Confirmando...' : 'Confirmar pedido'}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}

            <View style={styles.history}>
              <Text style={styles.heading}>Pedidos confirmados</Text>
              {loadingOrders ? (
                <Text style={styles.subtitle}>Carregando pedidos...</Text>
              ) : ordersError ? (
                <Text style={styles.errorText}>{ordersError}</Text>
              ) : orders.length === 0 ? (
                <Text style={styles.subtitle}>Seus pedidos confirmados aparecerão aqui.</Text>
              ) : (
                orders.map((order) => (
                  <View key={order.id} style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <Text style={styles.productName}>Pedido #{order.id}</Text>
                      <Text style={styles.status}>
                        {orderStatusLabels[order.status]}
                      </Text>
                    </View>
                    <Text style={styles.historyDetails}>
                      Mesa {order.tableNumber} ·{' '}
                      {order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
                    </Text>
                    <Text style={styles.historyDetails}>
                      {new Date(order.createdAt).toLocaleString('pt-BR')} ·{' '}
                      {formatPrice(order.totalCents)}
                    </Text>
                  </View>
                ))
              )}
            </View>
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
  panel: {
    flex: 1,
    marginTop: 12,
    backgroundColor: '#FFF9F1',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
  },
  content: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    padding: 22,
    paddingBottom: 40,
  },
  heading: {
    color: '#222222',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 7,
    color: '#777777',
    fontSize: 14,
    lineHeight: 20,
  },
  successMessage: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    color: '#216E39',
    lineHeight: 21,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    color: '#40231F',
    fontSize: 18,
    fontWeight: '700',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  itemInfo: {
    flex: 1,
  },
  productName: {
    color: '#40231F',
    fontSize: 16,
    fontWeight: '700',
  },
  itemPrice: {
    marginTop: 4,
    color: '#777777',
    fontSize: 13,
  },
  itemSubtotal: {
    marginTop: 4,
    color: '#F4511E',
    fontSize: 13,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE0D2',
  },
  quantityButtonText: {
    color: '#F4511E',
    fontSize: 18,
    fontWeight: '700',
  },
  quantity: {
    minWidth: 25,
    textAlign: 'center',
    color: '#40231F',
    fontWeight: '700',
  },
  removeText: {
    marginLeft: 4,
    color: '#B3261E',
    fontSize: 12,
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  tableLabel: {
    color: '#40231F',
    fontWeight: '600',
  },
  tableInput: {
    minWidth: 72,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    color: '#40231F',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
  },
  totalLabel: {
    color: '#40231F',
    fontSize: 18,
    fontWeight: '700',
  },
  totalPrice: {
    color: '#F4511E',
    fontSize: 20,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F4511E',
  },
  cancelText: {
    color: '#F4511E',
    fontWeight: '700',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  history: {
    marginTop: 36,
  },
  orderCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  status: {
    color: '#216E39',
    fontSize: 12,
    fontWeight: '700',
  },
  historyDetails: {
    marginTop: 7,
    color: '#777777',
    fontSize: 13,
    lineHeight: 19,
  },
  errorText: {
    marginTop: 8,
    color: '#B3261E',
  },
});

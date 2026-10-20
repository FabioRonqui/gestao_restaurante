
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import type { Order } from '../types/order';
import { orderStatusLabels } from '../utils/orderStatus';

type Props = {
  order: Order;
  onPress: () => void;
};

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR');
}

export default function OrderCard({ order, onPress }: Props) {
  const quantity = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurant}>
            {order.restaurantName}
          </Text>

          <Text style={styles.date}>
            Order #{order.id} · {formatDate(order.createdAt)}
          </Text>
        </View>

        <Text style={styles.quantity}>
          {quantity} {quantity === 1 ? 'item' : 'items'}
        </Text>
      </View>

      <View style={styles.divider} />

      {order.items.map((item) => (
        <View key={item.productId} style={styles.itemRow}>
          <Text style={styles.itemName}>
            {item.quantity}x {item.name}
          </Text>

          <Text style={styles.itemPrice}>
            {formatPrice(item.unitPriceCents * item.quantity)}
          </Text>
        </View>
      ))}

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.status}>
            {orderStatusLabels[order.status]}
          </Text>

          <Text style={styles.total}>
            {formatPrice(order.totalCents)}
          </Text>
        </View>

        <Pressable
          onPress={onPress}
          style={styles.button}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>View details</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  restaurantInfo: {
    flex: 1,
    marginRight: 8,
  },
  restaurant: {
    fontSize: 17,
    fontWeight: '700',
    color: '#242424',
  },
  date: {
    fontSize: 12,
    color: '#777777',
    marginTop: 5,
  },
  quantity: {
    fontSize: 12,
    color: '#666666',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#444444',
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 14,
    color: '#444444',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: 8,
    paddingTop: 14,
    gap: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  status: {
    flex: 1,
    fontSize: 12,
    color: '#E94E1B',
    fontWeight: '600',
  },
  total: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
  },
  button: {
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F04B1D',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

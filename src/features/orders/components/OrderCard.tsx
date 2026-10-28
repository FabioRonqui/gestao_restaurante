
import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Order } from '../types/order';

type OrderCardProps = {
  order: Order;
  onPress: () => void;
};

export function OrderCard({ order, onPress }: OrderCardProps) {
  const itemCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const formattedPrice = `$${(order.totalCents / 100).toFixed(2)}`;

  const formattedDate = new Date(order.createdAt)
    .toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .replace(',', ',');

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imagePlaceholder}>
        <Ionicons name="restaurant-outline" size={32} color="#F4511E" />
        <Text style={styles.imageLabel}>Food photo</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.restaurantName} numberOfLines={2}>
            {order.restaurantName}
          </Text>

          <Text style={styles.price}>{formattedPrice}</Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.orderInfo}>
            <Text style={styles.date}>{formattedDate}</Text>

            <View style={styles.statusRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#F4511E"
              />
              <Text style={styles.status}>Order delivered</Text>
            </View>
          </View>

          <Text style={styles.itemCount}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.reviewButton}
            onPress={() =>
              Alert.alert('Leave a review', 'Review feature coming soon.')
            }
          >
            <Text style={styles.reviewText}>Leave a review</Text>
          </Pressable>

          <Pressable
            style={styles.orderAgainButton}
            onPress={() =>
              Alert.alert('Order Again', 'Reordering will be available soon.')
            }
          >
            <Text style={styles.orderAgainText}>Order Again</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FFD3C2',
    gap: 14,
  },
  imagePlaceholder: {
    width: 88,
    height: 136,
    borderRadius: 22,
    backgroundColor: '#FFE0D2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageLabel: {
    color: '#F4511E',
    fontSize: 10,
    marginTop: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  restaurantName: {
    flex: 1,
    color: '#40231F',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 21,
  },
  price: {
    color: '#F4511E',
    fontSize: 19,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 5,
  },
  orderInfo: {
    flex: 1,
  },
  date: {
    color: '#40231F',
    fontSize: 13,
    marginBottom: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  status: {
    color: '#F4511E',
    fontSize: 12,
    flexShrink: 1,
  },
  itemCount: {
    color: '#40231F',
    fontSize: 13,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  reviewButton: {
    backgroundColor: '#F4511E',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  reviewText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  orderAgainButton: {
    backgroundColor: '#FFE0D2',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  orderAgainText: {
    color: '#F4511E',
    fontSize: 12,
  },
});
 

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';

import { mockOrders } from '../../features/orders/data/mockOrders';
import OrderCard from '../../features/orders/components/OrderCard';
//import type { OrderStatus } from '../../features/orders/types/order';

type Filter = 'all' | 'active' | 'delivered';

export default function OrdersScreen() {
  const [filter, setFilter] = useState<Filter>('all');

  const visibleOrders = mockOrders.filter((order) => {
    if (filter === 'active') {
      return !['delivered', 'cancelled'].includes(order.status);
    }

    if (filter === 'delivered') {
      return order.status === 'delivered';
    }

    return true;
  });

  const filters: { label: string; value: Filter }[] = [
    { label: 'All orders', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Delivered', value: 'delivered' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>
          Track your orders and view your history.
        </Text>
      </View>

      <View style={styles.filters}>
        {filters.map((item) => {
          const selected = filter === item.value;

          return (
            <Pressable
              key={item.value}
              onPress={() => setFilter(item.value)}
              style={[
                styles.filterButton,
                selected && styles.selectedFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selected && styles.selectedFilterText,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {visibleOrders.length > 0 ? (
          visibleOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() =>
                router.push(`/orders/${order.id}`)
              }
            />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              No orders found
            </Text>
            <Text style={styles.emptyText}>
              Your orders will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F1',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
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
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginTop: 22,
    marginBottom: 18,
  },
  filterButton: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  selectedFilter: {
    backgroundColor: '#F04B1D',
    borderColor: '#F04B1D',
  },
  filterText: {
    fontSize: 12,
    color: '#555555',
    fontWeight: '600',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  list: {
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

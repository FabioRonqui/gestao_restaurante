
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import OrdersHeader from '../../features/orders/components/OrdersHeader';
import OrdersTabBar from '../../features/orders/components/OrdersTabBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockOrders } from '../../features/orders/data/mockOrders';
import { OrderCard } from '../../features/orders/components/OrderCard';

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
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <View style={styles.container}>
        <OrdersHeader title="My Orders" onBack={() => router.back()} />

        <View style={styles.header}>
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
                onPress={() => router.push(`/orders/${order.id}`)}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No orders found</Text>
              <Text style={styles.emptyText}>
                Your orders will appear here.
              </Text>
            </View>
          )}
        </ScrollView>

        <OrdersTabBar activeTab="Orders" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F6F6',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F6F6',
  },
  header: {
    paddingHorizontal: 20,
  },
  subtitle: {
    marginTop: 8,
    color: '#40231F',
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
    backgroundColor: '#FFE0D2',
    borderWidth: 1,
    borderColor: '#FFD3C2',
  },
  selectedFilter: {
    backgroundColor: '#F4511E',
    borderColor: '#F4511E',
  },
  filterText: {
    fontSize: 12,
    color: '#40231F',
    fontWeight: '600',
  },
  selectedFilterText: {
    color: '#40231F',
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
    color: '#40231F',
  },
  emptyText: {
    marginTop: 8,
    color: '#40231F',
  },
});

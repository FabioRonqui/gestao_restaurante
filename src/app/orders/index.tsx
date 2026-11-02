import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { mockProducts } from '../../features/products/data/mockProducts';
import ProductTable from '../../features/products/components/ProductTable';
import { SafeAreaView } from 'react-native-safe-area-context';
import OrdersHeader from '../../features/orders/components/OrdersHeader'; // Adjust this path if your component file is elsewhere

export default function ProductsScreen() {
  const [searchText, setSearchText] = useState('');

  // Optional: Filter your products dynamically based on user typing
  const filteredProducts = mockProducts.filter(product => 
    product.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        
        {/* Replaced old static header with your dynamic OrdersHeader */}
        <OrdersHeader
          title="Pedidos"
          searchText={searchText}
          onChangeSearch={setSearchText}
          onFilterPress={() => console.log('Filter icon tapped!')}
        />

        {/* Central panel with rounded borders and cream background */}
        <View style={styles.productsPanel}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.productsScroll}
            contentContainerStyle={styles.content}
          >
            {filteredProducts.length > 0 ? (
              <ProductTable products={filteredProducts} />
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
    backgroundColor: '#F8CF58', // Replaced with Header Yellow matching OrdersHeader
  },
  container: {
    flex: 1,
    backgroundColor: '#F8CF58', // Replaced with Header Yellow matching OrdersHeader
  },
  productsPanel: {
    flex: 1,
    backgroundColor: '#FFF9F1', // Keeps your original cream color
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
    marginTop: 12, // Changed from negative margin to positive spacing so search stays visible!
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

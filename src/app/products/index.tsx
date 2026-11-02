// Tela "Produtos" do restaurante Delícias Rápidas.
// Fica acessível na rota /products (o expo-router cria a rota pelo nome da pasta).
// Visual igual ao da tela de pedidos: fundo creme, título grande e conteúdo em branco.
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../constants/theme';
import { mockProducts, restaurantName } from '../../features/products/data/mockProducts';
import ProductTable from '../../features/products/components/ProductTable';
import OrdersHeader from '../../features/orders/components/OrdersHeader';

export default function ProductsScreen() {
  const [searchText, setSearchText] = useState('');
  const filteredProducts = mockProducts.filter((product) =>
    product.name?.toLowerCase().includes(searchText.toLowerCase()),
  );

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
              <Text style={styles.restaurant}>{restaurantName}</Text>
              <Text style={styles.title}>Produtos</Text>
              <Text style={styles.subtitle}>
                {filteredProducts.length === 1
                  ? '1 produto no cardápio.'
                  : `${filteredProducts.length} produtos no cardápio.`}
              </Text>
            </View>

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
});

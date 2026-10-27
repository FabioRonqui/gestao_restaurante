// Tela "Produtos" do restaurante Delícias Rápidas.
// Fica acessível na rota /products (o expo-router cria a rota pelo nome da pasta).
// Visual igual ao da tela de pedidos: fundo creme, título grande e conteúdo em branco.
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { theme } from '../../constants/theme';
import { mockProducts, restaurantName } from '../../features/products/data/mockProducts';
import ProductTable from '../../features/products/components/ProductTable';

export default function ProductsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.restaurant}>{restaurantName}</Text>
          <Text style={styles.title}>Produtos</Text>
          <Text style={styles.subtitle}>
            {mockProducts.length === 1
              ? '1 produto no cardápio.'
              : `${mockProducts.length} produtos no cardápio.`}
          </Text>
        </View>

        {mockProducts.length > 0 ? (
          <ProductTable products={mockProducts} />
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
            <Text style={styles.emptyText}>Os produtos aparecerão aqui.</Text>
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
  },
  content: {
    width: '100%',
    maxWidth: 1100, // em telas muito grandes, o conteúdo não se espalha demais
    alignSelf: 'center',
    paddingTop: 60,
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

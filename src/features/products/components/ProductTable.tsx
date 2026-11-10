// Tabela responsiva do cardápio: em telas largas usa colunas; em celulares,
// cada produto vira um cartão com as informações e o botão de seleção.
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { theme } from '../../../constants/theme';
import type { Product } from '../types/product';
import { formatPrice } from '../utils/formatPrice';
import ProductImage from './ProductImage';

type Props = {
  products: Product[];
  onAddProduct: (product: Product) => void;
  selectedQuantities: Record<number, number>;
};

// Em telas menores que 720 px, os produtos são apresentados como cartões.
const TABLE_MIN_WIDTH = 720;

export default function ProductTable({
  products,
  onAddProduct,
  selectedQuantities,
}: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= TABLE_MIN_WIDTH;

  // Mantém as informações alinhadas em colunas quando há espaço suficiente.
  if (isWide) {
    return (
      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.headerText, styles.colName]}>Nome</Text>
          <Text style={[styles.headerText, styles.colPrice]}>Valor</Text>
          <Text style={[styles.headerText, styles.colDescription]}>Descrição</Text>
          <Text style={[styles.headerText, styles.colImage]}>Imagem</Text>
          <Text style={[styles.headerText, styles.colCategory]}>Categoria</Text>
          <Text style={[styles.headerText, styles.colAction]}>Pedido</Text>
        </View>

        {products.map((product, index) => (
          <View
            key={product.id}
            style={[
              styles.row,
              index % 2 === 1 && styles.rowAlt,
              index === products.length - 1 && styles.lastRow,
            ]}
          >
            <Text style={[styles.name, styles.colName]}>{product.name}</Text>
            <Text style={[styles.price, styles.colPrice]}>
              {formatPrice(product.priceCents)}
            </Text>
            <Text style={[styles.description, styles.colDescription]}>
              {product.description}
            </Text>
            <View style={styles.colImage}>
              <ProductImage uri={product.imageUrl} />
            </View>
            <View style={styles.colCategory}>
              <Text style={styles.badge}>{product.category}</Text>
            </View>
            <View style={styles.colAction}>
              <AddButton
                product={product}
                quantity={selectedQuantities[product.id] ?? 0}
                onPress={onAddProduct}
              />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View>
      {products.map((product) => (
        <View key={product.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <ProductImage uri={product.imageUrl} size={72} />
            <View style={styles.cardTitleBox}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.cardPrice}>{formatPrice(product.priceCents)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Categoria</Text>
            <Text style={styles.badge}>{product.category}</Text>
          </View>

          <View style={styles.fieldColumn}>
            <Text style={styles.fieldLabel}>Descrição</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <AddButton
            product={product}
            quantity={selectedQuantities[product.id] ?? 0}
            onPress={onAddProduct}
          />
        </View>
      ))}
    </View>
  );
}

function AddButton({
  product,
  quantity,
  onPress,
}: {
  product: Product;
  quantity: number;
  onPress: (product: Product) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Adicionar ${product.name} ao pedido`}
      style={styles.addButton}
      onPress={() => onPress(product)}
    >
      <Text style={styles.addButtonText}>
        {quantity > 0 ? `+  ${quantity}x` : 'Adicionar'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  rowAlt: {
    backgroundColor: '#FFFBF6',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  headerRow: {
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 0,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  colName: { flex: 2, paddingRight: 12 },
  colPrice: { flex: 1, paddingRight: 12 },
  colDescription: { flex: 3, paddingRight: 12 },
  colImage: { width: 90 },
  colCategory: { flex: 1.5 },
  colAction: { width: 112, alignItems: 'flex-end' },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#242424',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
  },
  description: {
    fontSize: 13,
    color: '#777777',
    lineHeight: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '600',
    color: '#E94E1B',
    backgroundColor: '#FDEBE5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.radius.round,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardTitleBox: {
    flex: 1,
  },
  cardPrice: {
    marginTop: 6,
    fontSize: 17,
    fontWeight: '700',
    color: '#F04B1D',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldColumn: {
    gap: 6,
  },
  addButton: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#F4511E',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
  },
});

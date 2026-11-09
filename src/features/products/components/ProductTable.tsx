// Tabela de produtos (colunas: Nome, Valor, Descrição, Imagem, Categoria).
//
// Responsividade:
// - Tela larga (computador/tablet): tabela de verdade, com cabeçalho e colunas.
// - Tela estreita (celular): cada linha vira um bloco, com o nome do campo
//   (Valor, Categoria...) ao lado da informação. Assim nada fica espremido.
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';

import { theme } from '../../../constants/theme';
import type { Product } from '../types/product';
import { formatPrice } from '../utils/formatPrice';
import ProductImage from './ProductImage';

type Props = {
  products: Product[];
  quantities?: Record<string, number>;
  onChangeQuantity?: (productId: string, change: number) => void;
};

// A partir desta largura (em pixels) usamos o formato de tabela.
const TABLE_MIN_WIDTH = 720;

export default function ProductTable({
  products,
  quantities = {},
  onChangeQuantity,
}: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= TABLE_MIN_WIDTH;

  if (isWide) {
    return (
      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.headerText, styles.colName]}>Nome</Text>
          <Text style={[styles.headerText, styles.colPrice]}>Valor</Text>
          <Text style={[styles.headerText, styles.colDescription]}>Descrição</Text>
          <Text style={[styles.headerText, styles.colImage]}>Imagem</Text>
          <Text style={[styles.headerText, styles.colCategory]}>Categoria</Text>
          {onChangeQuantity && (
            <Text style={[styles.headerText, styles.colOrder]}>Pedido</Text>
          )}
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
            {onChangeQuantity && (
              <View style={styles.colOrder}>
                <QuantityControl
                  productName={product.name}
                  quantity={quantities[product.id] ?? 0}
                  onChange={(change) => onChangeQuantity(product.id, change)}
                />
              </View>
            )}
          </View>
        ))}
      </View>
    );
  }

  // Formato para celular
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

          {onChangeQuantity && (
            <View style={styles.orderField}>
              <Text style={styles.fieldLabel}>Adicionar ao pedido</Text>
              <QuantityControl
                productName={product.name}
                quantity={quantities[product.id] ?? 0}
                onChange={(change) => onChangeQuantity(product.id, change)}
              />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

type QuantityControlProps = {
  productName: string;
  quantity: number;
  onChange: (change: number) => void;
};

function QuantityControl({ productName, quantity, onChange }: QuantityControlProps) {
  if (quantity === 0) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Adicionar ${productName} ao pedido`}
        onPress={() => onChange(1)}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>+ Adicionar</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.quantityControl}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remover uma unidade de ${productName}`}
        onPress={() => onChange(-1)}
        style={styles.quantityButton}
      >
        <Text style={styles.quantityButtonText}>-</Text>
      </Pressable>
      <Text style={styles.quantity}>{quantity}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Adicionar uma unidade de ${productName}`}
        onPress={() => onChange(1)}
        style={styles.quantityButton}
      >
        <Text style={styles.quantityButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // ---------- Tabela (tela larga) ----------
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
  // Larguras das colunas (cabeçalho e linhas usam as mesmas, por isso alinham).
  colName: { flex: 2, paddingRight: 12 },
  colPrice: { flex: 1, paddingRight: 12 },
  colDescription: { flex: 3, paddingRight: 12 },
  colImage: { width: 90 },
  colCategory: { flex: 1.5 },
  colOrder: { width: 124 },

  // ---------- Textos (usados nos dois formatos) ----------
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

  // ---------- Card (celular) ----------
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
  orderField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  addButton: {
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F04B1D',
    borderRadius: theme.radius.round,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDEBE5',
    borderRadius: theme.radius.round,
  },
  quantityButtonText: {
    color: '#E94E1B',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  quantity: {
    minWidth: 18,
    textAlign: 'center',
    color: '#242424',
    fontSize: 14,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
  },
});

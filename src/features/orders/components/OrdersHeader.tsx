//esse arquivo é o componente de cabeçalho da tela de pedidos.

import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  onBack?: () => void;
  searchText?: string;
  onChangeSearch?: (text: string) => void;
  onFilterPress?: () => void;
};

export default function OrdersHeader({ 
  title, 
  onBack, 
  searchText, 
  onChangeSearch, 
  onFilterPress 
}: Props) {
  return (
    <View style={styles.headerWrapper}>
      {/* Top Navigation Row */}
      <View style={styles.container}>
        <Pressable onPress={onBack} disabled={!onBack} style={styles.iconButton} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color="#40231F" />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rightSpace} />
      </View>

      {/* Integrated Search Bar Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9E9E9E" style={styles.icon} />
          <TextInput 
            placeholder="Search" 
            placeholderTextColor="#9E9E9E" 
            style={styles.input} 
            value={searchText}
            onChangeText={onChangeSearch}
          />
          <Pressable onPress={onFilterPress} style={styles.filterButton}>
            <Ionicons name="options" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#F8CF58', // Extends the original yellow header background down
    paddingBottom: 16,
  },
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,

  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#40231F',
  },
  rightSpace: {
    width: 40,
  },
  searchRow: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 46,
    borderRadius: 24,
    paddingHorizontal: 14,
    gap: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    marginRight: 0,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#40231F',
    paddingVertical: 0,
  },
  filterButton: {
    backgroundColor: '#FF5722',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons'; // Trocado para Feather para ícones mais finos e idênticos ao print
import { router } from 'expo-router';

// 1. Atualizado o tipo para aceitar os ícones da biblioteca Feather
type Tab = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  route: string;
};

// 2. Nova lista com os ícones lineares e o botão de suporte (fone) igual ao seu print
const tabs: Tab[] = [
  { label: 'Home', icon: 'home', route: '/' },
  { label: 'Search', icon: 'search', route: '/' },
  { label: 'Pedidos', icon: 'file-text', route: '/orders' }, // estilo 'receipt' linear
  { label: 'Profile', icon: 'user', route: '/' },
  { label: 'Support', icon: 'headphones', route: '/' }, // Ícone de fone da imagem
];

type Props = {
  activeTab?: string;
};

export default function OrdersTabBar({
  activeTab = 'Pedidos',
}: Props) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = tab.label === activeTab;

        return (
          <Pressable
            key={tab.label}
            style={styles.tab}
            onPress={() => {
              if (!active) {
                router.push(tab.route);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
          >
            {/* 3. SUBSTUA O <Ionicons /> POR ESTE NOVO COMPONENTE FEATHER COPIANDO ATÉ O FECHAMENTO DELE: */}
            <Feather
              name={tab.icon}
              size={22} // Tamanho sutilmente menor para destacar o traço fino
              color={active ? '#FFFFFF' : '#FFD3C2'}
            />

            <Text
              style={[
                styles.label,
                active && styles.activeLabel,
              ]}
            >
              {tab.label}
            </Text>

            {active && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

// ... mantenha seus styles.create embaixo normalmente


const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    backgroundColor: '#F4511E',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  tab: {
    flex: 1,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    color: '#FFD3C2', // Cor ajustada para legibilidade sobre o fundo laranja
    fontWeight: '500',
  },
  activeLabel: {
    color: '#FFFFFF', // Cor ajustada para legibilidade sobre o fundo laranja
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 22,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#FFFFFF', // Mudado para branco para destacar no fundo laranja
  },
});

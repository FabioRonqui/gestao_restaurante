//cabeçalho personalisado
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  onBack?: () => void;
};

export default function OrdersHeader({ title, onBack }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onBack}
        disabled={!onBack}
        style={styles.iconButton}
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={24} color="#40231F" />
      </Pressable>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.rightSpace} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#F8CF58',
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
});

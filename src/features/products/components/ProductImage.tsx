// Mostra a imagem do produto. Se não houver imagem, ou se ela não carregar
// (sem internet, link quebrado...), mostra um quadrado cinza no lugar,
// assim a tela nunca fica com um "buraco".
import { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';

type Props = {
  uri?: string;
  size?: number;
};

export default function ProductImage({ uri, size = 56 }: Props) {
  const [failed, setFailed] = useState(false);
  const box = { width: size, height: size };

  if (!uri || failed) {
    return <View style={[styles.base, styles.placeholder, box]} />;
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.base, box]}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
  },
  placeholder: {
    backgroundColor: '#EEEEEE',
  },
});

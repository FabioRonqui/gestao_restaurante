
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import BrandLogo from '../components/ui/BrandLogo';
import { theme } from '../constants/theme';

//Aqui é o codigo usado para fazer a tela esperar 3 segundos antes de ir para
//a tela de login. Por isso o nome SplashScreen.
export default function SplashScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => router.replace('/welcome'), 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <BrandLogo variant="welcome" isSplash />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

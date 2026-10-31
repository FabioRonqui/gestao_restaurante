import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import BrandLogo from '../components/ui/BrandLogo';
import { theme } from '../constants/theme';


export default function SplashScreen() {
  useEffect(() => {
    // Redireciona para /welcome após 3 segundos
    const timeout = setTimeout(() => router.replace('/welcome'), 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <BrandLogo variant="welcome" isSplash />
      </View>

      {/* Adicionado o indicador de carregamento que você planejava */}
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary || '#F4511E'} 
        style={styles.loader} 
      />
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
    marginBottom: 24, // Espaço entre a logo e o loader
  },
  loader: {
    marginTop: 16,
  },
});

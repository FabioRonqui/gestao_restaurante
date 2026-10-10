
//Aqui é onde editamos a tela para fazer cadastro e login.
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../constants/theme';
import BrandLogo  from '../../components/ui/BrandLogo';
//SOBRE O IMPORT:(react)
//Quando o import busca multiplos arquivos, ele usa chaves.
//E quando o import busca apenas um arquivo, ele não usa chaves.
export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      {/* Implemented BrandLogo here */}
      <View style={styles.brand}>
        <BrandLogo variant="welcome" />
      </View>

      <View style={styles.bottom}>
        <Text style={styles.description}>
          Delicious food, delivered to you.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  brand: {
    alignItems: 'center',
  },
  bottom: {
    width: '100%',
    alignItems: 'center',
  },
  description: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 28,
  },
  button: {
    width: '100%',
    backgroundColor: theme.colors.background,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: 16,
    fontWeight: '500',
  },
});

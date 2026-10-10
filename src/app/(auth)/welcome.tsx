
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../constants/theme';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <Text style={styles.logo}>♡</Text>

        <Text style={styles.brandName}>
          <Text style={styles.brandYellow}>YUM</Text>
          QUICK
        </Text>
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
  logo: {
    color: theme.colors.background,
    fontSize: 130,
    lineHeight: 150,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 8,
  },
  brandYellow: {
    color: theme.colors.background,
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

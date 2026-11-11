import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loginStaff } from '../../features/staff/staffService';

export default function LoginScreen() {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!/^\d{5,6}$/.test(registrationNumber) || !password) {
      setError('Informe o RE cadastrado e sua senha.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const session = await loginStaff(registrationNumber, password);
      switch (session.role) {
        case 'JUNIOR':
          router.replace('/staff-junior');
          break;
        case 'PLENO':
          router.replace('/staff-pleno');
          break;
        case 'GERENTE':
          router.replace('/staff');
          break;
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Não foi possível entrar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/welcome')}>
          <Text style={styles.back}>‹ Voltar</Text>
        </Pressable>
        <Text style={styles.eyebrow}>ACESSO RESTRITO</Text>
        <Text style={styles.title}>Área da equipe</Text>
        <Text style={styles.subtitle}>Entre com seu RE de funcionário e sua senha.</Text>
        <Text style={styles.label}>RE do funcionário</Text>
        <TextInput
          accessibilityLabel="RE do funcionário"
          autoComplete="username"
          autoCorrect={false}
          keyboardType="number-pad"
          maxLength={6}
          onChangeText={(value) => setRegistrationNumber(value.replace(/\D/g, ''))}
          placeholder="RE de 6 dígitos"
          style={styles.input}
          value={registrationNumber}
        />
        <Text style={styles.label}>Senha</Text>
        <TextInput
          accessibilityLabel="Senha"
          autoComplete="password"
          onChangeText={setPassword}
          onSubmitEditing={() => void handleLogin()}
          placeholder="Sua senha"
          secureTextEntry
          style={styles.input}
          value={password}
        />
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={() => void handleLogin()}
          style={[styles.button, submitting && styles.disabled]}
        >
          {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F4F1', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 26, gap: 12 },
  back: { color: '#68625D', fontSize: 15, fontWeight: '600', marginBottom: 8 },
  eyebrow: { color: '#E65B2B', fontSize: 12, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: '#202020', fontSize: 27, fontWeight: '800' },
  subtitle: { color: '#68625D', fontSize: 15, lineHeight: 21, marginBottom: 8 },
  label: { color: '#292929', fontSize: 14, fontWeight: '700', marginTop: 6 },
  input: { minHeight: 48, borderWidth: 1, borderColor: '#DDD7D1', borderRadius: 12, paddingHorizontal: 14, color: '#202020' },
  button: { minHeight: 48, backgroundColor: '#E65B2B', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.6 },
  error: { color: '#9B1C1C', backgroundColor: '#FCE8E6', borderRadius: 10, padding: 10 },
});

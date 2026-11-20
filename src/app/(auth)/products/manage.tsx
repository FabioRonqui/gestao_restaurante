import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getVerifiedStaffSession } from '../../../features/staff/staffService';

export default function ManageProductsScreen() {
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function verifyAccess() {
      try {
        const session = await getVerifiedStaffSession();
        if (!active) return;
        if (!session) {
          router.replace('/login');
          return;
        }
        if (session.role !== 'GERENTE') {
          router.replace('/welcome');
          return;
        }
        setAuthorized(true);
      } catch (verificationError) {
        if (!active) return;
        setError(
          verificationError instanceof Error
            ? verificationError.message
            : 'Não foi possível verificar o nível de acesso.',
        );
      }
    }

    void verifyAccess();
    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
      ) : authorized ? (
        <Text style={styles.title}>Gestão de produtos</Text>
      ) : (
        <ActivityIndicator color="#E65B2B" />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { color: '#202020', fontSize: 24, fontWeight: '700' },
  error: { color: '#9B1C1C', textAlign: 'center' },
});

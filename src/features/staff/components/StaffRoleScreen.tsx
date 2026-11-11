import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { getVerifiedStaffSession } from '../staffService';
import type { StaffRole, StaffSession } from '../types';
import StaffDashboard from './StaffDashboard';

type Props = {
  role: StaffRole;
};

function routeForRole(role: StaffRole) {
  switch (role) {
    case 'JUNIOR':
      return '/staff-junior';
    case 'PLENO':
      return '/staff-pleno';
    case 'GERENTE':
      return '/staff-manager';
  }
}

export default function StaffRoleScreen({ role }: Props) {
  const [session, setSession] = useState<StaffSession | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getVerifiedStaffSession()
      .then((verifiedSession) => {
        if (!active) return;
        if (!verifiedSession) {
          router.replace('/login');
          return;
        }
        if (verifiedSession.role !== role) {
          router.replace(routeForRole(verifiedSession.role));
          return;
        }
        setSession(verifiedSession);
      })
      .catch((sessionError: unknown) => {
        if (active) {
          setError(
            sessionError instanceof Error
              ? sessionError.message
              : 'Não foi possível verificar o nível de acesso.',
          );
        }
      });

    return () => {
      active = false;
    };
  }, [role]);

  if (session) return <StaffDashboard session={session} />;

  return (
    <View style={styles.loading}>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : <ActivityIndicator color="#E65B2B" />}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: '#9B1C1C', textAlign: 'center' },
});

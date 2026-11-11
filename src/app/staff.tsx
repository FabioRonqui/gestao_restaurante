import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getVerifiedStaffSession } from '../features/staff/staffService';
import type { StaffSession } from '../features/staff/types';

function routeForRole(role: StaffSession['role']) {
  switch (role) {
    case 'JUNIOR':
      return '/staff-junior';
    case 'PLENO':
      return '/staff-pleno';
    case 'GERENTE':
      return '/staff-manager';
  }
}

export default function StaffEntryScreen() {
  const [session, setSession] = useState<StaffSession | null>(null);
  const [error, setError] = useState('');
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    getVerifiedStaffSession()
      .then((currentSession) => {
        if (!active) return;
        if (!currentSession) {
          router.replace('/login');
          return;
        }
        setSession(currentSession);
        if (currentSession.role !== 'GERENTE') {
          router.replace(routeForRole(currentSession.role));
          return;
        }

        Animated.timing(animation, {
          toValue: 1,
          duration: 6000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (active && finished) router.replace('/staff-manager');
        });
      })
      .catch((sessionError: unknown) => {
        if (!active) return;
        setError(
          sessionError instanceof Error
            ? sessionError.message
            : 'Não foi possível verificar o nível de acesso.',
        );
      });

    return () => {
      active = false;
      animation.stopAnimation();
    };
  }, [animation]);

  const rocketStyle = {
    opacity: animation.interpolate({
      inputRange: [0, 0.12, 0.82, 1],
      outputRange: [0, 1, 1, 0.9],
    }),
    transform: [
      { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [100, -130] }) },
      { rotate: animation.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] }) },
      { scale: animation.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.75, 1.08, 1] }) },
    ],
  };
  const messageStyle = {
    opacity: animation.interpolate({
      inputRange: [0, 0.38, 0.58, 1],
      outputRange: [0, 0, 1, 1],
    }),
    transform: [{
      translateY: animation.interpolate({
        inputRange: [0.38, 0.65, 1],
        outputRange: [16, 0, 0],
      }),
    }],
  };

  if (session?.role === 'GERENTE') {
    return (
      <View style={styles.animationScreen}>
        <View style={styles.animationGlow} />
        <View style={[styles.star, styles.starOne]} />
        <View style={[styles.star, styles.starTwo]} />
        <View style={[styles.star, styles.starThree]} />
        <Animated.Text style={[styles.rocket, rocketStyle]}>🚀</Animated.Text>
        <Animated.View style={[styles.animationMessage, messageStyle]}>
          <Text style={styles.animationTitle}>OBRIGADO 2026!</Text>
          <Text style={styles.animationSubtitle}>Bem-vindo à área do gerente</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.loadingScreen}>
      {error ? (
        <View style={styles.errorCard}>
          <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => router.replace('/login')} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Voltar ao login</Text>
          </Pressable>
        </View>
      ) : (
        <ActivityIndicator color="#E65B2B" />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorCard: { width: '100%', maxWidth: 420, alignItems: 'center', gap: 14 },
  errorText: { color: '#9B1C1C', textAlign: 'center' },
  loginButton: { backgroundColor: '#E65B2B', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 11 },
  loginButtonText: { color: '#FFFFFF', fontWeight: '700' },
  animationScreen: { flex: 1, overflow: 'hidden', backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center', padding: 20 },
  animationGlow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#1A365D', opacity: 0.45 },
  star: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFFFFF', opacity: 0.8 },
  starOne: { top: '22%', left: '24%' },
  starTwo: { top: '32%', right: '22%', width: 3, height: 3 },
  starThree: { bottom: '28%', left: '32%', width: 3, height: 3 },
  rocket: { position: 'absolute', color: '#FFFFFF', fontSize: 82, textAlign: 'center' },
  animationMessage: { position: 'absolute', top: '68%', alignItems: 'center', gap: 8 },
  animationTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: 2, textAlign: 'center' },
  animationSubtitle: { color: '#B9D7F2', fontSize: 14, textAlign: 'center' },
});

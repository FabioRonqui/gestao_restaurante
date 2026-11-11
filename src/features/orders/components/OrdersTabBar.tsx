// esse arquivo é o componente de barra de navegação inferior.

import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useCart } from '../../cart/CartContext';
import { releaseTableSession } from '../services/orderService';

type TabRoute = '/welcome' | '/products' | '/orders';

type Tab = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  route?: TabRoute;
};

const tabs: Tab[] = [
  { label: 'Home', icon: 'home', route: '/welcome' },
  { label: 'Cardápio', icon: 'zap', route: '/products' },
  { label: 'Favorites', icon: 'heart' },
  { label: 'Orders', icon: 'file-text', route: '/orders' },
  { label: 'Sair', icon: 'x' },
];

type Props = {
  activeTab: string;
};

export default function OrdersTabBar({ activeTab }: Props) {
  const {
    itemCount,
    selectedTableNumber,
    tableSessionToken,
    clearCart,
    clearTableSession,
  } = useCart();
  const [isExitConfirmationVisible, setExitConfirmationVisible] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [releaseError, setReleaseError] = useState('');

  function confirmExit() {
    setReleaseError('');
    setExitConfirmationVisible(true);
  }

  async function releaseSession() {
    setIsReleasing(true);
    setReleaseError('');
    try {
      if (selectedTableNumber !== null && tableSessionToken !== null) {
        await releaseTableSession(selectedTableNumber, tableSessionToken);
      }
      clearCart();
      await clearTableSession();
      setExitConfirmationVisible(false);
      router.replace('/welcome');
    } catch (error) {
      setReleaseError(
        error instanceof Error ? error.message : 'Não foi possível liberar a mesa.',
      );
    } finally {
      setIsReleasing(false);
    }
  }

  return (
    <>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = tab.label === activeTab;

          return (
            <Pressable
              key={tab.label}
              style={styles.tab}
              onPress={() => {
                if (tab.label === 'Sair') {
                  confirmExit();
                  return;
                }
                if (!active && tab.route) {
                  router.navigate(tab.route);
                }
              }}
              disabled={tab.label !== 'Sair' && (!tab.route || active)}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{
                selected: active,
                disabled: tab.label !== 'Sair' && (!tab.route || active),
              }}
            >
              <View style={styles.iconContainer}>
                <Feather
                  name={tab.icon}
                  size={23}
                  color={active ? '#FFFFFF' : '#FFD3C2'}
                />
                {tab.label === 'Orders' && itemCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {itemCount > 99 ? '99+' : itemCount}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.label, active && styles.activeLabel]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isExitConfirmationVisible}
        onRequestClose={() => {
          if (!isReleasing) setExitConfirmationVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sair da mesa</Text>
            <Text style={styles.modalMessage}>Deseja desocupar esta mesa?</Text>
            {releaseError ? (
              <Text accessibilityRole="alert" style={styles.releaseError}>
                {releaseError}
              </Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                disabled={isReleasing}
                onPress={() => setExitConfirmationVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelText}>Não</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isReleasing}
                onPress={() => void releaseSession()}
                style={[styles.modalButton, styles.confirmButton]}
              >
                <Text style={styles.confirmText}>
                  {isReleasing ? 'Liberando...' : 'Sim'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    backgroundColor: '#F4511E',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    color: '#FFD3C2',
    fontWeight: '500',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -9,
    right: -14,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#40231F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  activeLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#FFF9F1',
  },
  modalTitle: {
    color: '#40231F',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalMessage: {
    color: '#40231F',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  releaseError: {
    marginTop: 14,
    color: '#B3261E',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 24,
  },
  cancelButton: {
    backgroundColor: '#E8E8E8',
  },
  confirmButton: {
    backgroundColor: '#F4511E',
  },
  cancelText: {
    color: '#40231F',
    fontWeight: '700',
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

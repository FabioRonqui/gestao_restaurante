
//Aqui é onde editamos a tela para fazer cadastro e login.
import {
  Alert,
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { theme } from '../../constants/theme';
import BrandLogo  from '../../components/ui/BrandLogo';
import { addMesa } from '../../features/tables/data/mesasStorage';
import { useCart } from '../../features/cart/CartContext';
import {
  getTableAvailability,
  startTableSession,
} from '../../features/orders/services/orderService';
//SOBRE O IMPORT:(react)
//Quando o import busca multiplos arquivos, ele usa chaves.
//E quando o import busca apenas um arquivo, ele não usa chaves.
export default function WelcomeScreen() {
  const [tableNumber, setTableNumber] = useState('');
  const [isAddTableModalVisible, setIsAddTableModalVisible] = useState(false);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isTableRegistered, setIsTableRegistered] = useState<boolean | null>(null);
  const [isTableAvailable, setIsTableAvailable] = useState<boolean | null>(null);
  const [availabilityError, setAvailabilityError] = useState('');
  const [availabilityRetry, setAvailabilityRetry] = useState(0);
  const unavailableAnimation = useRef(new Animated.Value(0)).current;
  const {
    clearCart,
    selectedTableNumber,
    tableSessionToken,
    tableSessionReady,
    tableSessionError,
    retryTableSessionRestore,
    setTableSession,
  } = useCart();
  const isTableNumberValid =
    Number.isSafeInteger(Number(tableNumber)) && Number(tableNumber) > 0;

  useEffect(() => {
    if (isTableAvailable === false) {
      Animated.timing(unavailableAnimation, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
      return;
    }

    unavailableAnimation.setValue(0);
  }, [isTableAvailable, unavailableAnimation]);

  useEffect(() => {
    if (!tableSessionReady || tableSessionError) {
      setIsCheckingAvailability(false);
      setIsTableAvailable(null);
      setIsTableRegistered(null);
      return;
    }

    if (!isTableNumberValid) {
      setIsTableAvailable(null);
      setIsTableRegistered(null);
      setAvailabilityError('');
      setIsCheckingAvailability(false);
      return;
    }

    let active = true;
    setIsCheckingAvailability(true);
    setIsTableRegistered(null);
    setIsTableAvailable(null);
    setAvailabilityError('');
    const timeout = setTimeout(() => {
      getTableAvailability(Number(tableNumber), tableSessionToken)
        .then(({ registered, available }) => {
          if (active) {
            setIsTableRegistered(registered);
            setIsTableAvailable(available);
          }
        })
        .catch((error: unknown) => {
          if (active) {
            setAvailabilityError(
              error instanceof Error
                ? error.message
                : 'Não foi possível verificar a disponibilidade da mesa.',
            );
          }
        })
        .finally(() => {
          if (active) setIsCheckingAvailability(false);
        });
    }, 350);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [
    availabilityRetry,
    isTableNumberValid,
    tableNumber,
    tableSessionError,
    tableSessionReady,
    tableSessionToken,
  ]);

  const openProducts = async () => {
    if (!isTableNumberValid) {
      Alert.alert('Número da mesa inválido', 'Informe um número de mesa válido para continuar.');
      return;
    }
    if (!isTableAvailable) return;

    const selectedNumber = Number(tableNumber);
    if (
      tableSessionToken !== null &&
      selectedTableNumber !== null &&
      selectedTableNumber !== selectedNumber
    ) {
      Alert.alert(
        'Mesa já selecionada',
        'Para escolher outra mesa, use o botão X Sair e desocupe a mesa atual primeiro.',
      );
      return;
    }

    setIsStartingSession(true);
    try {
      const session = await startTableSession(selectedNumber, tableSessionToken);
      if (session.token !== tableSessionToken) clearCart();
      await setTableSession(selectedNumber, session.token);
      router.push({
        pathname: '/products',
        params: { tableNumber },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Tente novamente em instantes.';
      if (message.includes('nao esta disponivel')) {
        setIsTableAvailable(false);
        return;
      }
      Alert.alert(
        'Não foi possível iniciar o pedido',
        message,
      );
    } finally {
      setIsStartingSession(false);
    }
  };

  const requestAddTable = () => {
    if (!isTableNumberValid) {
      Alert.alert('Número da mesa inválido', 'Informe um número de mesa válido para adicionar.');
      return;
    }

    setIsAddTableModalVisible(true);
  };

  const confirmAddTable = async () => {
    setIsAddingTable(true);

    try {
      const added = await addMesa(Number(tableNumber));
      setIsAddTableModalVisible(false);

      if (!added) {
        Alert.alert('Mesa já cadastrada', `A mesa ${tableNumber} já existe.`);
        return;
      }

      setAvailabilityRetry((retry) => retry + 1);
      Alert.alert('Mesa adicionada', `A mesa ${tableNumber} foi adicionada à tela de mesas.`);
    } catch (error) {
      console.error('Não foi possível salvar a mesa.', error);
      Alert.alert(
        'Erro ao adicionar mesa',
        error instanceof Error ? error.message : 'Não foi possível salvar a mesa.',
      );
    } finally {
      setIsAddingTable(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <BrandLogo variant="welcome" />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
            A fome bateu? A gente resolve!
        </Text>

        <View style={styles.tableInputRow}>
          <TextInput
            accessibilityLabel="Número da mesa"
            style={styles.tableInput}
            value={tableNumber}
            onChangeText={(value) => {
              setTableNumber(value.replace(/\D/g, ''));
              setIsTableRegistered(null);
              setIsTableAvailable(null);
            }}
            placeholder="Número da mesa"
            placeholderTextColor="#777777"
            keyboardType="number-pad"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar mesa"
            style={styles.incrementButton}
            onPress={requestAddTable}
          >
            <Text style={styles.incrementButtonText}>+</Text>
          </Pressable>
        </View>

        {tableSessionError ? (
          <View style={styles.availabilityError}>
            <Text accessibilityRole="alert" style={styles.unavailableMessageText}>
              {tableSessionError}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={retryTableSessionRestore}
            >
              <Text style={styles.retryAvailabilityText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : !tableSessionReady || isCheckingAvailability ? (
          <Text style={styles.availabilityMessage}>
            {!tableSessionReady
              ? 'Restaurando sua sessão...'
              : 'Verificando disponibilidade da mesa...'}
          </Text>
        ) : isTableRegistered === false ? (
          <Text style={styles.availabilityMessage}>
            Mesa não cadastrada. Use o botão + para cadastrá-la.
          </Text>
        ) : isTableAvailable === false ? (
          <Animated.View
            accessibilityRole="alert"
            style={[
              styles.unavailableMessage,
              {
                opacity: unavailableAnimation,
                transform: [
                  {
                    translateY: unavailableAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-8, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.unavailableMessageText}>
              Infelizmente essa mesa nao esta disponivel, Tente outro numero
            </Text>
          </Animated.View>
        ) : availabilityError ? (
          <View style={styles.availabilityError}>
            <Text accessibilityRole="alert" style={styles.unavailableMessage}>
              Não foi possível verificar a mesa. Confira sua conexão e tente novamente.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setAvailabilityRetry((retry) => retry + 1)}
            >
              <Text style={styles.retryAvailabilityText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            disabled:
              !isTableNumberValid ||
              isStartingSession ||
              isCheckingAvailability ||
              isTableRegistered !== true ||
              isTableAvailable !== true ||
              Boolean(availabilityError),
          }}
          disabled={
            !isTableNumberValid ||
            isStartingSession ||
            isCheckingAvailability ||
            isTableRegistered !== true ||
            isTableAvailable !== true ||
            Boolean(availabilityError)
          }
          style={[
            styles.button,
            (!isTableNumberValid ||
              isStartingSession ||
              isCheckingAvailability ||
              isTableRegistered !== true ||
              isTableAvailable !== true ||
              Boolean(availabilityError)) &&
              styles.buttonDisabled,
          ]}
          onPress={() => void openProducts()}
        >
          <Text style={styles.buttonText}>
            {isStartingSession
              ? 'Preparando mesa...'
              : isCheckingAvailability
                ? 'Verificando mesa...'
                : 'Ver produtos'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          style={styles.footerButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.footerButtonText}>Login</Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isAddTableModalVisible}
        onRequestClose={() => {
          if (!isAddingTable) {
            setIsAddTableModalVisible(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Adicionar mesa</Text>
            <Text style={styles.modalMessage}>
              Deseja realmente adicionar a mesa {tableNumber}?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                disabled={isAddingTable}
                onPress={() => setIsAddTableModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isAddingTable}
                onPress={confirmAddTable}
                style={[styles.modalButton, styles.confirmButton]}
              >
                <Text style={styles.confirmButtonText}>
                  {isAddingTable ? 'Adicionando...' : 'Confirmar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 60,
    paddingBottom: 24,
  },
  brand: {
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    alignItems: 'center',
  },
  description: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  tableInputRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  tableInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  incrementButton: {
    width: 48,
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incrementButtonText: {
    color: theme.colors.buttonText,
    fontSize: 24,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    backgroundColor: theme.colors.background,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: 16,
    fontWeight: '500',
  },
  availabilityMessage: {
    width: '100%',
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
  },
  unavailableMessage: {
    width: '100%',
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFF0ED',
  },
  unavailableMessageText: {
    color: '#A3261D',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  availabilityError: {
    alignItems: 'center',
  },
  retryAvailabilityText: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
  },
  footerButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  footerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: theme.colors.background,
  },
  modalTitle: {
    color: theme.colors.buttonText,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalMessage: {
    color: theme.colors.buttonText,
    fontSize: 16,
    marginTop: 12,
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
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.buttonText,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

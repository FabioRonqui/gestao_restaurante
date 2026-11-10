
//Aqui é onde editamos a tela para fazer cadastro e login.
import {
  Alert,
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { theme } from '../../constants/theme';
import BrandLogo  from '../../components/ui/BrandLogo';
import { addMesa } from '../../features/tables/data/mesasStorage';
//SOBRE O IMPORT:(react)
//Quando o import busca multiplos arquivos, ele usa chaves.
//E quando o import busca apenas um arquivo, ele não usa chaves.
export default function WelcomeScreen() {
  const [tableNumber, setTableNumber] = useState('');
  const [isAddTableModalVisible, setIsAddTableModalVisible] = useState(false);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const isTableNumberValid =
    Number.isSafeInteger(Number(tableNumber)) && Number(tableNumber) > 0;

  const openProducts = () => {
    if (!isTableNumberValid) {
      Alert.alert('Número da mesa inválido', 'Informe um número de mesa válido para continuar.');
      return;
    }

    router.push({
      pathname: '/products',
      params: { tableNumber },
    });
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
            onChangeText={(value) => setTableNumber(value.replace(/\D/g, ''))}
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

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !isTableNumberValid }}
          disabled={!isTableNumberValid}
          style={[styles.button, !isTableNumberValid && styles.buttonDisabled]}
          onPress={openProducts}
        >
          <Text style={styles.buttonText}>Ver produtos</Text>
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

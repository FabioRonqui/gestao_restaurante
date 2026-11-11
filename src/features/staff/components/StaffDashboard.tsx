import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatPrice } from '../../products/utils/formatPrice';
import type { Product } from '../../products/types/product';
import {
  addStaffMember,
  addStaffProduct,
  confirmOrderPayment,
  getPendingStaffOrders,
  getTodayStaffOrders,
  getStaffMembers,
  getStaffProducts,
  getStaffTables,
  logoutStaff,
  registerStaffTable,
  removeStaffProduct,
} from '../staffService';
import type { StaffMember, StaffOrder, StaffSession } from '../types';
import type { TableRecord } from '../../tables/services/tableService';

const ACCESS_LABELS = {
  JUNIOR: 'Junior',
  PLENO: 'Pleno / Administrador',
  GERENTE: 'Gerente',
} as const;

type StaffDashboardProps = {
  session: StaffSession;
};

type ManagerView = 'transactions' | 'tables' | 'menu' | 'staff';

const MANAGER_NAV: { key: ManagerView; label: string }[] = [
  { key: 'transactions', label: 'Transações do dia' },
  { key: 'tables', label: 'Mesas' },
  { key: 'menu', label: 'Cardápio' },
  { key: 'staff', label: 'Funcionários' },
];

function getOrderStatusLabel(status: StaffOrder['status']) {
  switch (status) {
    case 'pending':
      return 'Aguardando pagamento';
    case 'cancelled':
      return 'Cancelado';
    case 'confirmed':
      return 'Pagamento confirmado';
    case 'preparing':
      return 'Em preparo';
    case 'out_for_delivery':
      return 'A caminho da mesa';
    case 'delivered':
      return 'Entregue';
  }
}

export default function StaffDashboard({ session }: StaffDashboardProps) {
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [todayOrders, setTodayOrders] = useState<StaffOrder[]>([]);
  const [managerView, setManagerView] = useState<ManagerView>('transactions');
  const [products, setProducts] = useState<Product[]>([]);
  const [productPendingRemoval, setProductPendingRemoval] = useState<Product | null>(null);
  const [tables, setTables] = useState<TableRecord[]>([]);
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [tableSeats, setTableSeats] = useState('2');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberRe, setMemberRe] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const isManager = session.role === 'GERENTE';
  const isJunior = session.role === 'JUNIOR';
  const canManage = session.role === 'PLENO' || isManager;
  const canConfirmPayment = canManage;
  const compactLayout = useWindowDimensions().width < 760;
  const visibleOrders = isManager ? todayOrders : orders;
  const confirmedTodayCents = todayOrders
    .filter((order) => order.status !== 'pending' && order.status !== 'cancelled')
    .reduce((total, order) => total + order.totalCents, 0);
  const pendingTodayCents = todayOrders
    .filter((order) => order.status === 'pending')
    .reduce((total, order) => total + order.totalCents, 0);

  const refresh = useCallback(async (token: string, role: StaffSession['role']) => {
    setLoading(true);
    setError('');
    try {
      const [pendingOrders, tableList, productList] = await Promise.all([
        getPendingStaffOrders(token),
        getStaffTables(token),
        getStaffProducts(token),
      ]);
      setOrders(pendingOrders);
      setTables(tableList.mesas);
      setProducts(productList);
      if (role === 'GERENTE') {
        const [staffMembers, dailyOrders] = await Promise.all([
          getStaffMembers(token),
          getTodayStaffOrders(token),
        ]);
        setMembers(staffMembers);
        setTodayOrders(dailyOrders);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar os dados da equipe.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh(session.token, session.role);
    const timer = setInterval(() => {
      void refresh(session.token, session.role);
    }, 15000);
    return () => clearInterval(timer);
  }, [refresh, session]);

  async function handleConfirmPayment(orderId: number) {
    if (!canConfirmPayment) return;
    setBusyAction(true);
    setError('');
    try {
      await confirmOrderPayment(session.token, orderId);
      setNotice(`Pagamento do pedido #${orderId} confirmado.`);
      await refresh(session.token, session.role);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Não foi possível confirmar o pagamento.');
    } finally {
      setBusyAction(false);
    }
  }

  async function handleAddTable() {
    if (!canManage) return;
    const number = Number(tableNumber);
    const seats = Number(tableSeats);
    if (!Number.isSafeInteger(number) || number < 1 || !Number.isSafeInteger(seats) || seats < 1) {
      setError('Informe números válidos para a mesa e a quantidade de lugares.');
      return;
    }
    setBusyAction(true);
    setError('');
    try {
      const result = await registerStaffTable(session.token, number, seats);
      if (!result.cadastrada) {
        setError(`A mesa ${number} já está cadastrada.`);
        return;
      }
      setTableNumber('');
      setNotice(`Mesa ${number} cadastrada.`);
      await refresh(session.token, session.role);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Não foi possível cadastrar a mesa.');
    } finally {
      setBusyAction(false);
    }
  }

  async function handleAddProduct() {
    if (!canManage) return;
    const price = Number(productPrice.replace(',', '.'));
    if (!productName.trim() || !Number.isFinite(price) || price <= 0) {
      setError('Informe o nome do prato e um preço válido.');
      return;
    }
    setBusyAction(true);
    setError('');
    try {
      await addStaffProduct(session.token, {
        name: productName.trim(),
        priceCents: Math.round(price * 100),
        description: productDescription.trim(),
      });
      setProductName('');
      setProductPrice('');
      setProductDescription('');
      setNotice('Prato adicionado ao cardápio.');
      await refresh(session.token, session.role);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Não foi possível adicionar o prato.');
    } finally {
      setBusyAction(false);
    }
  }

  async function handleRemoveProduct(product: Product) {
    if (!isManager) return;
    setProductPendingRemoval(product);
  }

  async function confirmRemoveProduct() {
    if (!isManager || !productPendingRemoval) return;
    setBusyAction(true);
    setError('');
    try {
      await removeStaffProduct(session.token, productPendingRemoval.id);
      setNotice(`${productPendingRemoval.name} removido do cardápio.`);
      setProductPendingRemoval(null);
      await refresh(session.token, session.role);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Não foi possível remover o prato.');
    } finally {
      setBusyAction(false);
    }
  }

  async function handleAddMember() {
    if (!isManager) return;
    setBusyAction(true);
    setError('');
    try {
      await addStaffMember(session.token, {
        registrationNumber: memberRe,
        name: memberName.trim(),
        password: memberPassword,
      });
      setMemberRe('');
      setMemberName('');
      setMemberPassword('');
      setNotice('Funcionário cadastrado. Compartilhe a senha com ele de forma segura.');
      await refresh(session.token, session.role);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Não foi possível cadastrar o funcionário.');
    } finally {
      setBusyAction(false);
    }
  }

  async function handleLogout() {
    if (!session) return;
    try {
      await logoutStaff(session.token);
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Não foi possível encerrar a sessão.');
      return;
    }
    router.replace('/welcome');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={[styles.dashboardShell, isManager && styles.managerShell, isManager && compactLayout && styles.managerShellCompact]}>
        {isManager ? (
          <View style={[styles.sidebar, compactLayout && styles.sidebarCompact]}>
            <View style={styles.sidebarBrand}>
              <Text style={styles.sidebarEyebrow}>GESTÃO</Text>
              <Text style={styles.sidebarTitle}>Restaurante</Text>
              <Text style={styles.sidebarUser}>{session.name} · Gerente</Text>
            </View>
            <View style={[styles.sidebarNav, compactLayout && styles.sidebarNavCompact]}>
              {MANAGER_NAV.map((item) => {
                const selected = managerView === item.key;
                return (
                  <Pressable
                    key={item.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setManagerView(item.key)}
                    style={[styles.sidebarItem, selected && styles.sidebarItemSelected, compactLayout && styles.sidebarItemCompact]}
                  >
                    <Text style={[styles.sidebarItemText, selected && styles.sidebarItemTextSelected]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable accessibilityRole="button" onPress={() => void handleLogout()} style={styles.sidebarLogout}>
              <Text style={styles.sidebarLogoutText}>Sair da conta</Text>
            </Pressable>
          </View>
        ) : null}
      <ScrollView style={isManager ? styles.managerMain : undefined} contentContainerStyle={[styles.page, isManager && styles.managerPage]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{isManager
              ? MANAGER_NAV.find((item) => item.key === managerView)?.label.toUpperCase()
              : isJunior ? 'PAINEL DA COZINHA E SALÃO' : 'PAINEL ADMINISTRATIVO'}</Text>
            <Text style={styles.title}>{isManager
              ? MANAGER_NAV.find((item) => item.key === managerView)?.label
              : `Olá, ${session.name}`}</Text>
            <Text style={styles.role}>{isManager ? `Olá, ${session.name} · Gerente` : ACCESS_LABELS[session.role]}</Text>
          </View>
          {!isManager ? (
            <Pressable accessibilityRole="button" onPress={() => void handleLogout()} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Sair</Text>
            </Pressable>
          ) : null}
        </View>

        {(!isManager || managerView === 'transactions') ? <View style={styles.summary}>
          <View>
            <Text style={styles.summaryLabel}>{isManager ? 'TRANSAÇÕES DE HOJE' : 'PEDIDOS PENDENTES'}</Text>
            <Text style={styles.summaryCount}>{isManager ? todayOrders.length : orders.length}</Text>
          </View>
          {isManager ? (
            <>
              <View>
                <Text style={styles.summaryLabel}>RECEBIDO</Text>
                <Text style={styles.summaryMetric}>{formatPrice(confirmedTodayCents)}</Text>
              </View>
              <View>
                <Text style={styles.summaryLabel}>AGUARDANDO</Text>
                <Text style={styles.summaryMetric}>{formatPrice(pendingTodayCents)}</Text>
              </View>
            </>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={() => void refresh(session.token, session.role)}
            style={styles.refreshButton}
          >
            <Text style={styles.refreshText}>{loading ? 'Atualizando...' : 'Atualizar'}</Text>
          </Pressable>
        </View> : null}

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        {visibleOrders.length === 0 && !loading && (!isManager || managerView === 'transactions') ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{isManager ? 'Nenhuma transação hoje' : 'Nenhum pedido pendente'}</Text>
            <Text style={styles.bodyText}>{isManager ? 'Os pedidos registrados hoje aparecerão nesta área.' : 'Os novos pedidos aparecem aqui automaticamente.'}</Text>
          </View>
        ) : null}

        {(!isManager || managerView === 'transactions') && visibleOrders.map((order) => (
          <View key={order.id} style={styles.card}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderTitle}>Pedido #{order.id}</Text>
              <Text style={styles.tableBadge}>Mesa {order.tableNumber}</Text>
            </View>
            <Text style={styles.muted}>Recebido {new Date(order.createdAt).toLocaleString('pt-BR')}</Text>
            {order.items.map((item, index) => (
              <View key={`${item.productId}-${index}`}>
                <Text style={styles.orderItem}>{item.quantity}x {item.name}</Text>
                {item.description ? <Text style={styles.muted}>{item.description}</Text> : null}
              </View>
            ))}
            <View style={styles.orderFooter}>
              <Text style={styles.total}>{formatPrice(order.totalCents)}</Text>
              {canConfirmPayment && order.status === 'pending' ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={busyAction}
                  onPress={() => void handleConfirmPayment(order.id)}
                  style={[styles.primaryButton, busyAction && styles.disabled]}
                >
                  <Text style={styles.primaryButtonText}>Pagamento recebido</Text>
                </Pressable>
              ) : isManager ? (
                <Text style={order.status === 'pending' ? styles.pendingLabel : styles.confirmedLabel}>
                  {getOrderStatusLabel(order.status)}
                </Text>
              ) : (
                <Text style={styles.pendingLabel}>Aguardando pagamento</Text>
              )}
            </View>
          </View>
        ))}

        {canManage && (!isManager || managerView === 'tables') ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mesas</Text>
              <Text style={styles.bodyText}>Cadastro permitido para Pleno e Gerente.</Text>
              <View style={styles.formRow}>
                <TextInput
                  accessibilityLabel="Número da nova mesa"
                  keyboardType="number-pad"
                  onChangeText={setTableNumber}
                  placeholder="Nº da mesa"
                  style={[styles.input, styles.shortInput]}
                  value={tableNumber}
                />
                <TextInput
                  accessibilityLabel="Lugares da mesa"
                  keyboardType="number-pad"
                  onChangeText={setTableSeats}
                  placeholder="Lugares"
                  style={[styles.input, styles.shortInput]}
                  value={tableSeats}
                />
                <Pressable disabled={busyAction} onPress={() => void handleAddTable()} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Adicionar</Text>
                </Pressable>
              </View>
              <Text style={styles.muted}>Cadastradas: {tables.map((table) => table.numero).join(', ') || 'nenhuma'}</Text>
            </View>
        ) : null}
        {canManage && (!isManager || managerView === 'menu') ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cardápio</Text>
              <Text style={styles.bodyText}>Pleno pode adicionar; somente o gerente pode remover.</Text>
              <TextInput accessibilityLabel="Nome do prato" onChangeText={setProductName} placeholder="Nome do prato" style={styles.input} value={productName} />
              <TextInput accessibilityLabel="Preço do prato" keyboardType="decimal-pad" onChangeText={setProductPrice} placeholder="Preço (R$)" style={styles.input} value={productPrice} />
              <TextInput accessibilityLabel="Descrição do prato" onChangeText={setProductDescription} placeholder="Descrição / acompanhamentos" style={styles.input} value={productDescription} />
              <Pressable disabled={busyAction} onPress={() => void handleAddProduct()} style={[styles.primaryButton, styles.fullButton]}>
                <Text style={styles.primaryButtonText}>Adicionar prato</Text>
              </Pressable>
              {isManager ? products.map((product) => (
                <View key={product.id} style={styles.listRow}>
                  <View style={styles.listInfo}>
                    <Text style={styles.orderItem}>{product.name}</Text>
                    <Text style={styles.muted}>{formatPrice(product.priceCents)}</Text>
                  </View>
                  {productPendingRemoval?.id === product.id ? (
                    <View style={styles.confirmActions}>
                      <Pressable
                        accessibilityRole="button"
                        disabled={busyAction}
                        onPress={() => void confirmRemoveProduct()}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeText}>Confirmar</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        disabled={busyAction}
                        onPress={() => setProductPendingRemoval(null)}
                        style={styles.cancelRemoveButton}
                      >
                        <Text style={styles.cancelRemoveText}>Cancelar</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      disabled={busyAction}
                      onPress={() => handleRemoveProduct(product)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeText}>Remover</Text>
                    </Pressable>
                  )}
                </View>
              )) : null}
            </View>
        ) : null}

        {isManager && managerView === 'staff' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Funcionários</Text>
            <Text style={styles.bodyText}>Os três últimos dígitos do RE devem começar com 2 (Junior) ou 5 (Pleno).</Text>
            <TextInput accessibilityLabel="Nome do funcionário" onChangeText={setMemberName} placeholder="Nome" style={styles.input} value={memberName} />
            <TextInput accessibilityLabel="RE do funcionário" keyboardType="number-pad" maxLength={6} onChangeText={(value) => setMemberRe(value.replace(/\D/g, ''))} placeholder="RE de seis dígitos" style={styles.input} value={memberRe} />
            <TextInput accessibilityLabel="Senha do funcionário" onChangeText={setMemberPassword} placeholder="Senha (mínimo 6 caracteres)" secureTextEntry style={styles.input} value={memberPassword} />
            <Pressable disabled={busyAction} onPress={() => void handleAddMember()} style={[styles.primaryButton, styles.fullButton]}>
              <Text style={styles.primaryButtonText}>Cadastrar funcionário</Text>
            </Pressable>
            {members.map((member) => (
              <View key={member.registrationNumber} style={styles.listRow}>
                <Text style={styles.orderItem}>{member.name} · RE {member.registrationNumber}</Text>
                <Text style={styles.muted}>{ACCESS_LABELS[member.role]}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F4F1' },
  dashboardShell: { flex: 1 },
  managerShell: { flexDirection: 'row' },
  managerShellCompact: { flexDirection: 'column' },
  sidebar: { width: 240, backgroundColor: '#202020', padding: 20, gap: 24 },
  sidebarCompact: { width: '100%', padding: 14, gap: 12 },
  sidebarBrand: { gap: 5 },
  sidebarEyebrow: { color: '#E9835D', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  sidebarTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  sidebarUser: { color: '#C6C1BC', fontSize: 13, marginTop: 4 },
  sidebarNav: { gap: 8 },
  sidebarNavCompact: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  sidebarItem: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  sidebarItemCompact: { flexGrow: 1, flexBasis: '45%', paddingHorizontal: 10, paddingVertical: 10 },
  sidebarItemSelected: { backgroundColor: '#E65B2B' },
  sidebarItemText: { color: '#D5D0CB', fontSize: 14, fontWeight: '600' },
  sidebarItemTextSelected: { color: '#FFFFFF', fontWeight: '800' },
  sidebarLogout: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#454545', paddingTop: 16 },
  sidebarLogoutText: { color: '#FFFFFF', fontWeight: '700', paddingVertical: 8 },
  managerMain: { flex: 1 },
  page: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: 24, gap: 16 },
  managerPage: { width: '100%', maxWidth: 1100, padding: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  eyebrow: { color: '#E65B2B', fontSize: 12, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: '#202020', fontSize: 28, fontWeight: '800', marginTop: 4 },
  role: { color: '#686868', fontSize: 14, marginTop: 4 },
  logoutButton: { backgroundColor: '#E8E3DE', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 10 },
  logoutText: { color: '#292929', fontWeight: '700' },
  summary: { backgroundColor: '#202020', borderRadius: 18, padding: 20, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  summaryLabel: { color: '#C6C1BC', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  summaryCount: { color: '#FFFFFF', fontSize: 34, fontWeight: '800', marginTop: 4 },
  summaryMetric: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', marginTop: 9 },
  refreshButton: { backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10 },
  refreshText: { color: '#202020', fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, gap: 8, borderWidth: 1, borderColor: '#EAE6E1' },
  orderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderTitle: { color: '#202020', fontSize: 18, fontWeight: '800' },
  tableBadge: { color: '#9B3D1D', backgroundColor: '#FFF0E8', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, fontWeight: '700' },
  muted: { color: '#77716C', fontSize: 13 },
  orderItem: { color: '#292929', fontSize: 15, fontWeight: '600' },
  orderFooter: { borderTopWidth: 1, borderTopColor: '#EEEAE6', marginTop: 8, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  total: { color: '#202020', fontSize: 17, fontWeight: '800' },
  pendingLabel: { color: '#875A13', backgroundColor: '#FFF3D5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, fontSize: 13, fontWeight: '700' },
  confirmedLabel: { color: '#195D36', backgroundColor: '#E6F4EA', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, fontSize: 13, fontWeight: '700' },
  primaryButton: { backgroundColor: '#E65B2B', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 11, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, gap: 10, borderWidth: 1, borderColor: '#EAE6E1' },
  sectionTitle: { color: '#202020', fontSize: 20, fontWeight: '800' },
  bodyText: { color: '#68625D', fontSize: 14, lineHeight: 20 },
  formRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { width: '100%', minHeight: 44, borderWidth: 1, borderColor: '#DDD7D1', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#FFFFFF', color: '#202020' },
  shortInput: { flex: 1 },
  fullButton: { width: '100%', marginBottom: 4 },
  listRow: { borderTopWidth: 1, borderTopColor: '#EEEAE6', paddingTop: 10, marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  listInfo: { flex: 1, gap: 4 },
  removeButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFF0ED', borderRadius: 12 },
  confirmActions: { flexDirection: 'row', gap: 8 },
  removeText: { color: '#A3261D', fontSize: 13, fontWeight: '700' },
  cancelRemoveButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#EEEAE6', borderRadius: 12 },
  cancelRemoveText: { color: '#292929', fontSize: 13, fontWeight: '700' },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', gap: 6 },
  emptyTitle: { color: '#202020', fontSize: 18, fontWeight: '700' },
  error: { width: '100%', color: '#9B1C1C', backgroundColor: '#FCE8E6', borderRadius: 12, padding: 12 },
  notice: { width: '100%', color: '#195D36', backgroundColor: '#E6F4EA', borderRadius: 12, padding: 12 },
});

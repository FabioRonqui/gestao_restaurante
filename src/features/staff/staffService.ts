import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiRequest } from '../../services/api';
import type { StaffMember, StaffSession, StaffOrder } from './types';
import type { Product } from '../products/types/product';
import type { TableListResponse } from '../tables/services/tableService';

const SESSION_KEY = 'restaurant.staff-session';

export async function loginStaff(
  registrationNumber: string,
  password: string,
): Promise<StaffSession> {
  const session = await apiRequest<StaffSession>('/staff/login', {
    method: 'POST',
    body: JSON.stringify({ registrationNumber, password }),
  });
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const savedSession = await AsyncStorage.getItem(SESSION_KEY);
  if (!savedSession) return null;

  try {
    return JSON.parse(savedSession) as StaffSession;
  } catch (error) {
    await AsyncStorage.removeItem(SESSION_KEY);
    throw new Error('A sessão da equipe está inválida. Entre novamente.', { cause: error });
  }
}

export async function getVerifiedStaffSession(): Promise<StaffSession | null> {
  const savedSession = await getStaffSession();
  if (!savedSession) return null;

  const verifiedSession = await apiRequest<StaffSession>('/staff/session', {
    headers: { 'X-Staff-Token': savedSession.token },
  });
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(verifiedSession));
  return verifiedSession;
}

export async function logoutStaff(token: string): Promise<void> {
  try {
    await apiRequest<void>('/staff/session', {
      method: 'DELETE',
      headers: { 'X-Staff-Token': token },
    });
  } finally {
    await AsyncStorage.removeItem(SESSION_KEY);
  }
}

function staffHeaders(token: string) {
  return { 'X-Staff-Token': token };
}

export function getPendingStaffOrders(token: string): Promise<StaffOrder[]> {
  return apiRequest<StaffOrder[]>('/orders/staff/pending', {
    headers: staffHeaders(token),
  });
}

export function confirmOrderPayment(token: string, orderId: number): Promise<StaffOrder> {
  return apiRequest<StaffOrder>(`/orders/${orderId}/payment`, {
    method: 'PATCH',
    headers: staffHeaders(token),
  });
}

export function getStaffTables(token: string): Promise<TableListResponse> {
  return apiRequest<TableListResponse>('/tables', {
    headers: staffHeaders(token),
  });
}

export function registerStaffTable(
  token: string,
  numero: number,
  pessoas: number,
): Promise<{ cadastrada: boolean }> {
  return apiRequest<{ cadastrada: boolean }>('/tables', {
    method: 'POST',
    headers: staffHeaders(token),
    body: JSON.stringify({ numero, pessoas }),
  });
}

export function getStaffProducts(token: string): Promise<Product[]> {
  return apiRequest<Product[]>('/products', {
    headers: staffHeaders(token),
  });
}

export function addStaffProduct(
  token: string,
  product: { name: string; priceCents: number; description: string },
): Promise<Product> {
  return apiRequest<Product>('/products', {
    method: 'POST',
    headers: staffHeaders(token),
    body: JSON.stringify(product),
  });
}

export function removeStaffProduct(token: string, productId: number): Promise<void> {
  return apiRequest<void>(`/products/${productId}`, {
    method: 'DELETE',
    headers: staffHeaders(token),
  });
}

export function getStaffMembers(token: string): Promise<StaffMember[]> {
  return apiRequest<StaffMember[]>('/staff', {
    headers: staffHeaders(token),
  });
}

export function addStaffMember(
  token: string,
  member: { registrationNumber: string; name: string; password: string },
): Promise<StaffMember> {
  return apiRequest<StaffMember>('/staff', {
    method: 'POST',
    headers: staffHeaders(token),
    body: JSON.stringify(member),
  });
}

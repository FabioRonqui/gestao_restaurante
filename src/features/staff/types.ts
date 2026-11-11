import type { Order } from '../orders/types/order';

export type StaffRole = 'JUNIOR' | 'PLENO' | 'GERENTE';

export type StaffSession = {
  token: string;
  registrationNumber: string;
  name: string;
  role: StaffRole;
};

export type StaffMember = {
  registrationNumber: string;
  name: string;
  role: StaffRole;
};

export type StaffOrder = Order;

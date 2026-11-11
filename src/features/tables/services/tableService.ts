import { apiRequest } from '../../../services/api';

export type TableRecord = {
  numero: number;
  pessoas: number;
  status: 'livre' | 'ocupada';
};

export type TableListResponse = {
  totalMesas: number;
  mesas: TableRecord[];
};

export function getTables(): Promise<TableListResponse> {
  return apiRequest<TableListResponse>('/tables');
}

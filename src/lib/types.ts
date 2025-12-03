export type SaleStatus = 'Pendente' | 'Pago' | 'Caiu';

export const ALL_STATUSES: SaleStatus[] = ['Pendente', 'Pago', 'Caiu'];

export type Sale = {
  id: string;
  saleDate: Date;
  corretor: string;
  clientName: string;
  empreendimento: string;
  construtora: string;
  saleValue: number;
  commission: number;
  status: SaleStatus;
};

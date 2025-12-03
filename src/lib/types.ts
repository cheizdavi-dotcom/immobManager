export type SaleStatus = 'Pendente' | 'Pago' | 'Caiu';
export type CommissionStatus = 'Pendente' | 'Pago';

export const ALL_STATUSES: SaleStatus[] = ['Pendente', 'Pago', 'Caiu'];

export type Corretor = {
  id: string;
  name: string;
  phone: string;
  photoUrl: string;
}

export type Sale = {
  id: string;
  saleDate: Date;
  corretorId: string;
  clientName: string;
  empreendimento: string;
  construtora: string;
  saleValue: number;
  commission: number;
  status: SaleStatus;
  commissionStatus: CommissionStatus;
};

    
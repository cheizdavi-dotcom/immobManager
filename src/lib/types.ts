export type SaleStatus = 'Pendente' | 'Pago' | 'Caiu';
export type CommissionStatus = 'Pendente' | 'Pago';
export type ClientStatus = 'Frio' | 'Morno' | 'Quente';

export const ALL_STATUSES: SaleStatus[] = ['Pendente', 'Pago', 'Caiu'];
export const ALL_CLIENT_STATUSES: ClientStatus[] = ['Frio', 'Morno', 'Quente'];

export type Corretor = {
  id: string;
  name: string;
  phone: string;
  photoUrl: string;
};

export type Client = {
    id: string;
    name: string;
    phone: string;
    cpf?: string;
    status: ClientStatus;
}

export type Development = {
    id: string;
    name: string;
    construtora: string;
    localizacao: string;
}

export type Sale = {
  id: string;
  saleDate: Date;
  corretorId: string;
  clientId: string; 
  clientName: string; // This is deprecated
  developmentId: string; 
  empreendimento: string; // This is deprecated
  construtora: string;
  saleValue: number;
  atoValue: number;
  commissionPercentage: number | null;
  commission: number;
  status: SaleStatus;
  commissionStatus: CommissionStatus;
  observations?: string;
  combinado?: string;
  combinadoDate?: Date | null;
};

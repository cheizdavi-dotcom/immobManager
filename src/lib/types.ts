export type SaleStatus =
  | 'Proposta / Cadastro'
  | 'Análise de Crédito / SPC'
  | 'Aguardando Assinatura'
  | 'Aguardando Pagamento Ato'
  | 'Venda Concluída / Paga'
  | 'Venda Cancelada / Caiu';

export type CommissionStatus = 'Pendente' | 'Pago';
export type ClientStatus = 'Frio' | 'Morno' | 'Quente';

export const ALL_STATUSES: SaleStatus[] = [
  'Proposta / Cadastro',
  'Análise de Crédito / SPC',
  'Aguardando Assinatura',
  'Aguardando Pagamento Ato',
  'Venda Concluída / Paga',
  'Venda Cancelada / Caiu',
];

export const ALL_CLIENT_STATUSES: ClientStatus[] = ['Frio', 'Morno', 'Quente'];

export type Corretor = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  photoUrl?: string;
};

export type Client = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  cpf?: string;
  status: ClientStatus;
};

export type Development = {
  id: string;
  userId: string;
  name: string;
  construtora: string;
  localizacao: string;
};

export type Sale = {
  id: string;
  userId: string;
  saleDate: string; // Stored as ISO string
  corretorId: string;
  clientId: string;
  developmentId: string;
  saleValue: number;
  atoValue: number;
  commissionPercentage: number | null;
  commission: number;
  status: SaleStatus;
  commissionStatus: CommissionStatus;
  observations?: string;
  combinado?: string;
  combinadoDate?: string | null; // Stored as ISO string
};

// Added for local authentication
export type User = {
    id: string;
    name: string;
    email: string;
    password?: string; // Not for production use
    photoUrl?: string;
}

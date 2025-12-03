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
};

export type Development = {
  id: string;
  name: string;
  construtora: string;
  localizacao: string;
};

export type Sale = {
  id: string;
  saleDate: Date;
  corretorId: string;
  clientId: string;
  developmentId: string;
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
  // Denormalized fields for easier access
  clientName: string;
  empreendimento: string;
};

import type { Sale, Corretor, Client, Development } from './types';

export const corretores: Corretor[] = [
    {
        id: 'corretor-1',
        userId: 'user-1',
        name: 'Carlos Santana',
        phone: '(11) 98765-4321',
        photoUrl: 'https://i.pravatar.cc/150?u=carlos'
    },
    {
        id: 'corretor-2',
        userId: 'user-1',
        name: 'Juliana Paiva',
        phone: '(21) 91234-5678',
        photoUrl: 'https://i.pravatar.cc/150?u=juliana'
    },
     {
        id: 'corretor-3',
        userId: 'user-1',
        name: 'Roberto Justos',
        phone: '(31) 95555-8888',
        photoUrl: 'https://i.pravatar.cc/150?u=roberto'
    },
];

export const clients: Client[] = [
    {
        id: 'client-1',
        userId: 'user-1',
        name: 'Fernanda Lima',
        phone: '(41) 99999-0000',
        cpf: '123.456.789-00',
        status: 'Quente'
    },
    {
        id: 'client-2',
        userId: 'user-1',
        name: 'Marcos Paulo',
        phone: '(51) 98888-1111',
        cpf: '098.765.432-11',
        status: 'Morno'
    },
     {
        id: 'client-3',
        userId: 'user-1',
        name: 'Ana Maria Braga',
        phone: '(61) 97777-2222',
        cpf: '555.666.777-88',
        status: 'Frio'
    }
];

export const developments: Development[] = [
  {
    id: 'dev-1',
    userId: 'user-1',
    name: 'Residencial Vista Verde',
    construtora: 'Tenda',
    localizacao: 'Centro, São Paulo'
  },
  {
    id: 'dev-2',
    userId: 'user-1',
    name: 'Parque das Flores',
    construtora: 'MRV',
    localizacao: 'Barra, Rio de Janeiro'
  },
  {
    id: 'dev-3',
    userId: 'user-1',
    name: 'Condomínio Sol Nascente',
    construtora: 'Direcional',
    localizacao: 'Savassi, Belo Horizonte'
  }
];


export const sales: Sale[] = [
    {
        id: 'sale-1',
        userId: 'user-1',
        saleDate: '2023-10-26T10:00:00Z',
        corretorId: 'corretor-1',
        clientId: 'client-1',
        developmentId: 'dev-1',
        construtora: 'Tenda',
        saleValue: 250000,
        atoValue: 20000,
        commissionPercentage: 5,
        commission: 12500,
        status: 'Venda Concluída / Paga',
        commissionStatus: 'Pago',
        observations: 'Cliente pagou à vista o valor do ato. Documentação OK.',
        combinado: 'Enviar chaves na próxima semana',
        combinadoDate: '2023-11-03T10:00:00Z'
    },
    {
        id: 'sale-2',
        userId: 'user-1',
        saleDate: '2023-11-15T14:30:00Z',
        corretorId: 'corretor-2',
        clientId: 'client-2',
        developmentId: 'dev-2',
        construtora: 'MRV',
        saleValue: 180000,
        atoValue: 10000,
        commissionPercentage: 4.5,
        commission: 8100,
        status: 'Aguardando Assinatura',
        commissionStatus: 'Pendente',
        observations: 'Cliente aguardando liberação do FGTS para o ato. Análise de crédito aprovada.',
        combinado: 'Follow-up sobre FGTS',
        combinadoDate: '2023-11-22T10:00:00Z'
    },
    {
        id: 'sale-3',
        userId: 'user-1',
        saleDate: '2023-11-20T11:00:00Z',
        corretorId: 'corretor-1',
        clientId: 'client-3',
        developmentId: 'dev-3',
        construtora: 'Direcional',
        saleValue: 320000,
        atoValue: 30000,
        commissionPercentage: 5.5,
        commission: 17600,
        status: 'Análise de Crédito / SPC',
        commissionStatus: 'Pendente',
        observations: 'Cliente com pequena restrição no SPC, regularizando.',
        combinado: 'Verificar status da regularização',
        combinadoDate: '2023-11-28T10:00:00Z'
    },
     {
        id: 'sale-4',
        userId: 'user-1',
        saleDate: '2023-09-05T16:00:00Z',
        corretorId: 'corretor-3',
        clientId: 'client-2',
        developmentId: 'dev-1',
        construtora: 'Tenda',
        saleValue: 245000,
        atoValue: 20000,
        commissionPercentage: 5,
        commission: 12250,
        status: 'Venda Cancelada / Caiu',
        commissionStatus: 'Pendente',
        observations: 'Cliente desistiu da compra por motivos pessoais.',
        combinado: 'Oferecer outro empreendimento',
        combinadoDate: null
    },
];

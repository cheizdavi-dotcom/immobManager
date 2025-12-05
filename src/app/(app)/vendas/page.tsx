'use client';
import { useMemo, useState, useEffect } from 'react';
import { SalesTable } from '@/components/sales-table';
import { NewSaleDialog } from '@/components/new-sale-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getYear, getMonth } from 'date-fns';
import type { Sale, Corretor, Client, Development, User } from '@/lib/types';
import {
  sales as initialSalesData,
  corretores as initialCorretores,
  clients as initialClients,
  developments as initialDevelopments,
} from '@/lib/data';
import useLocalStorage from '@/hooks/useLocalStorage';
import { KanbanBoard } from '@/components/kanban-board';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { List, LayoutGrid } from 'lucide-react';
import { ALL_STATUSES } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function VendasPage() {
  const [user] = useLocalStorage<User | null>('user', null);
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', initialSalesData);
  const [corretores, setCorretores] = useLocalStorage<Corretor[]>('corretores', initialCorretores);
  const [clients, setClients] = useLocalStorage<Client[]>('clients', initialClients);
  const [developments, setDevelopments] = useLocalStorage<Development[]>('developments', initialDevelopments);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [construtoraFilter, setConstrutoraFilter] = useState('all');

  const handleAddOrUpdateSale = async (saleData: Omit<Sale, 'id' | 'userId'>, id?: string) => {
    try {
        let savedSale: Sale;
        if (id) {
            savedSale = { ...saleData, id, userId: user!.id, commissionStatus: sales.find(s => s.id === id)?.commissionStatus || 'Pendente' };
            setSales(prev => prev.map(s => s.id === id ? savedSale : s));
        } else {
            savedSale = { ...saleData, id: crypto.randomUUID(), userId: user!.id, commissionStatus: 'Pendente' };
            setSales(prev => [...prev, savedSale]);
        }
        
        toast({
            title: id ? 'Venda Atualizada!' : 'Venda Cadastrada!',
            description: 'A venda foi salva com sucesso.',
        });
        return savedSale;
    } catch(err: any) {
        toast({ variant: 'destructive', title: 'Erro ao salvar venda.', description: err.message });
        return null;
    }
  };

  const handleDeleteSale = (saleId: string) => {
     setSales((prev) => prev.filter((s) => s.id !== saleId));
     toast({
        title: 'Venda Excluída!',
        description: 'A venda foi removida com sucesso.',
    });
  }

  const handleClientSubmit = async (clientData: Omit<Client, 'id' | 'userId'>) => {
    const newClient = { ...clientData, id: crypto.randomUUID(), userId: user!.id };
    setClients(prev => [...prev, newClient]);
    return newClient;
  }

  const handleDevelopmentSubmit = async (devData: Omit<Development, 'id' | 'userId'>) => {
    const newDev = { ...devData, id: crypto.randomUUID(), userId: user!.id };
    setDevelopments(prev => [...prev, newDev]);
    return newDev;
  }


  const clientsMap = useMemo(() => clients.reduce((acc, client) => ({ ...acc, [client.id]: client }), {} as Record<string, Client>), [clients]);
  const developmentsMap = useMemo(() => developments.reduce((acc, dev) => ({ ...acc, [dev.id]: dev }), {} as Record<string, Development>), [developments]);
  const corretoresMap = useMemo(() => corretores.reduce((acc, corretor) => ({ ...acc, [corretor.id]: corretor }), {} as Record<string, Corretor>), [corretores]);


  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
        const saleDate = new Date(sale.saleDate);
        const saleMonth = getMonth(saleDate);
        const saleYear = getYear(saleDate);

        const clientName = clientsMap[sale.clientId]?.name || '';
        const clientNameMatch = clientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
        
        const construtoraMatch = construtoraFilter === 'all' || (developmentsMap[sale.developmentId]?.construtora.toLowerCase() === construtoraFilter.toLowerCase());

        const monthMatch =
        monthFilter === 'all' || saleMonth === parseInt(monthFilter);

        const yearMatch = yearFilter === 'all' || saleYear === parseInt(yearFilter);

        return clientNameMatch && monthMatch && yearMatch && construtoraMatch;
    })
  }, [sales, searchTerm, monthFilter, yearFilter, construtoraFilter, clientsMap, developmentsMap]);

  const uniqueYears = useMemo(() => {
    return Array.from(
        new Set(sales.map((sale) => getYear(new Date(sale.saleDate))))
    ).sort((a,b) => b - a)
  }, [sales]);

  const uniqueConstrutoras = useMemo(() => {
    return Array.from(
        new Set(developments.map((dev) => dev.construtora))
  ).sort()
}, [developments]);


  return (
    <main className="flex flex-1 flex-col">
       <Tabs defaultValue="tabela" className="flex flex-col flex-1">
        <div className="flex flex-col gap-4 border-b p-4 md:p-6">
            <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Vendas Realizadas</h2>
             <div className="flex items-center gap-2">
                <TabsList>
                    <TabsTrigger value="tabela"><List className="h-4 w-4" /></TabsTrigger>
                    <TabsTrigger value="kanban"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
                </TabsList>
                <NewSaleDialog 
                    onSaleSubmit={handleAddOrUpdateSale} 
                    corretores={corretores} 
                    clients={clients} 
                    onClientSubmit={handleClientSubmit} 
                    developments={developments} 
                    onDevelopmentSubmit={handleDevelopmentSubmit} 
                />
            </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
            <Input
                placeholder="Pesquisar por Cliente..."
                className="max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">Todos os Meses</SelectItem>
                {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i} value={String(i)}>
                    {new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'long' })}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">Todos os Anos</SelectItem>
                {uniqueYears.map((year) => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
                </SelectContent>
            </Select>
             <Select value={construtoraFilter} onValueChange={setConstrutoraFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Construtora" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">Todas as Construtoras</SelectItem>
                {uniqueConstrutoras.map((construtora) => (
                    <SelectItem key={construtora} value={construtora}>{construtora}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <TabsContent value="tabela">
                <SalesTable 
                    sales={filteredSales} 
                    onSaleSubmit={handleAddOrUpdateSale} 
                    onDeleteSale={handleDeleteSale}
                    corretores={corretores}
                    corretoresMap={corretoresMap}
                    clientsMap={clientsMap}
                    developmentsMap={developmentsMap}
                    clients={clients}
                    onClientSubmit={handleClientSubmit}
                    developments={developments}
                    onDevelopmentSubmit={handleDevelopmentSubmit}
                />
            </TabsContent>
            <TabsContent value="kanban" className="flex-1">
                <KanbanBoard 
                    sales={filteredSales} 
                    statuses={ALL_STATUSES}
                    onSaleSubmit={handleAddOrUpdateSale}
                    corretoresMap={corretoresMap}
                    clientsMap={clientsMap}
                    developmentsMap={developmentsMap}
                    corretores={corretores}
                    clients={clients}
                    developments={developments}
                    onClientSubmit={handleClientSubmit}
                    onDevelopmentSubmit={handleDevelopmentSubmit}
                />
            </TabsContent>
        </div>
       </Tabs>
    </main>
  );
}

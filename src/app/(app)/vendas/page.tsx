'use client';
import { useMemo, useState } from 'react';
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
import type { Sale, Corretor, Client, Development } from '@/lib/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { KanbanBoard } from '@/components/kanban-board';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { List, LayoutGrid } from 'lucide-react';
import { ALL_STATUSES } from '@/lib/types';

export default function VendasPage() {
  const [salesData, setSalesData] = useLocalStorage<Sale[]>('sales', []);
  const [corretoresData] = useLocalStorage<Corretor[]>('corretores', []);
  const [clientsData, setClientsData] = useLocalStorage<Client[]>('clients', []);
  const [developmentsData, setDevelopmentsData] = useLocalStorage<Development[]>('developments', []);

  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [construtoraFilter, setConstrutoraFilter] = useState('all');

  const addOrUpdateSale = (sale: Sale) => {
    setSalesData((prevSales) => {
      const existingSaleIndex = prevSales.findIndex((s) => s.id === sale.id);
      if (existingSaleIndex !== -1) {
        const updatedSales = [...prevSales];
        updatedSales[existingSaleIndex] = sale;
        return updatedSales;
      }
      return [...prevSales, sale];
    });
  };

  const deleteSale = (saleId: string) => {
    setSalesData((prevSales) => prevSales.filter((s) => s.id !== saleId));
  };


  const clientsMap = useMemo(() => {
    if (!clientsData) return {};
    return clientsData.reduce((acc, client) => {
        acc[client.id] = client;
        return acc;
    }, {} as Record<string, Client>);
  }, [clientsData]);

  const developmentsMap = useMemo(() => {
    if (!developmentsData) return {};
    return developmentsData.reduce((acc, dev) => {
        acc[dev.id] = dev;
        return acc;
    }, {} as Record<string, Development>);
  }, [developmentsData]);

  const filteredSales = useMemo(() => {
    return salesData.filter((sale) => {
        const saleDate = new Date(sale.saleDate);
        const saleMonth = getMonth(saleDate);
        const saleYear = getYear(saleDate);

        const clientName = clientsMap[sale.clientId]?.name || '';
        const clientNameMatch = clientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
        
        const construtoraMatch = construtoraFilter === 'all' || (sale.construtora && sale.construtora.toLowerCase() === construtoraFilter.toLowerCase());

        const monthMatch =
        monthFilter === 'all' || saleMonth === parseInt(monthFilter);

        const yearMatch = yearFilter === 'all' || saleYear === parseInt(yearFilter);

        return clientNameMatch && monthMatch && yearMatch && construtoraMatch;
    })
  }, [salesData, searchTerm, monthFilter, yearFilter, construtoraFilter, clientsMap]);

  const uniqueYears = useMemo(() => {
    return Array.from(
        new Set(salesData.map((sale) => getYear(new Date(sale.saleDate))))
    ).sort((a,b) => b - a)
  }, [salesData]);

  const uniqueConstrutoras = useMemo(() => {
    return Array.from(
        new Set(salesData.map((dev) => dev.construtora).filter(Boolean))
  ).sort()
}, [salesData]);

  const corretoresMap = useMemo(() => {
    return corretoresData.reduce((acc, corretor) => {
        acc[corretor.id] = corretor;
        return acc;
    }, {} as Record<string, Corretor>);
  }, [corretoresData]);

  const addClient = (client: Client) => {
    setClientsData(prev => [...prev, client]);
  }

  const addDevelopment = (dev: Development) => {
    setDevelopmentsData(prev => [...prev, dev]);
  }

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
                <NewSaleDialog onSaleSubmit={addOrUpdateSale} corretores={corretoresData} clients={clientsData} onClientSubmit={addClient} developments={developmentsData} onDevelopmentSubmit={addDevelopment} />
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
                    onSaleSubmit={addOrUpdateSale} 
                    onDeleteSale={deleteSale}
                    corretores={corretoresData}
                    corretoresMap={corretoresMap}
                    clientsMap={clientsMap}
                    developmentsMap={developmentsMap}
                    clients={clientsData}
                    onClientSubmit={addClient}
                    developments={developmentsData}
                    onDevelopmentSubmit={addDevelopment}
                />
            </TabsContent>
            <TabsContent value="kanban" className="flex-1">
                <KanbanBoard 
                    sales={filteredSales} 
                    statuses={ALL_STATUSES}
                    onSaleSubmit={addOrUpdateSale}
                    corretoresMap={corretoresMap}
                    clientsMap={clientsMap}
                    developmentsMap={developmentsMap}
                    corretores={corretoresData}
                    clients={clientsData}
                    developments={developmentsData}
                    onClientSubmit={addClient}
                    onDevelopmentSubmit={addDevelopment}
                />
            </TabsContent>
        </div>
       </Tabs>
    </main>
  );
}

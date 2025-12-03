'use client';
import { useState } from 'react';
import { sales } from '@/lib/data';
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
import type { Sale } from '@/lib/types';

export default function VendasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [salesData, setSalesData] = useState<Sale[]>(sales);

  const addOrUpdateSale = (sale: Sale) => {
    setSalesData((prevSales) => {
      const existingSaleIndex = prevSales.findIndex((s) => s.id === sale.id);
      if (existingSaleIndex > -1) {
        // Update existing sale
        const updatedSales = [...prevSales];
        updatedSales[existingSaleIndex] = sale;
        return updatedSales;
      } else {
        // Add new sale
        return [...prevSales, sale];
      }
    });
  };

  const deleteSale = (saleId: string) => {
    setSalesData((prevSales) => prevSales.filter((s) => s.id !== saleId));
  };


  const filteredSales = salesData.filter((sale) => {
    const saleDate = new Date(sale.saleDate);
    const saleMonth = getMonth(saleDate);
    const saleYear = getYear(saleDate);

    const clientNameMatch = sale.clientName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const monthMatch =
      monthFilter === 'all' || saleMonth === parseInt(monthFilter);

    const yearMatch = yearFilter === 'all' || saleYear === parseInt(yearFilter);

    return clientNameMatch && monthMatch && yearMatch;
  });

  const uniqueYears = Array.from(
    new Set(salesData.map((sale) => getYear(new Date(sale.saleDate))))
  ).sort((a,b) => b - a);

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 border-b p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Vendas Realizadas</h2>
          <NewSaleDialog onSaleSubmit={addOrUpdateSale}/>
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
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <SalesTable sales={filteredSales} onSaleSubmit={addOrUpdateSale} onDeleteSale={deleteSale} />
      </div>
    </main>
  );
}

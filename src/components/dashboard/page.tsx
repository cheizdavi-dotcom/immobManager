'use client';
import { sales as initialSales, corretores as initialCorretores } from '@/lib/data';
import type { Sale, Corretor } from '@/lib/types';
import { isThisMonth } from 'date-fns';
import { KpiCard } from '@/components/kpi-card';
import { SalesChart } from '@/components/sales-chart';
import { AttentionList } from '@/components/attention-list';
import {
  DollarSign,
  TrendingUp,
  BarChart,
  Activity,
  FileText,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { NewSaleDialog } from '@/components/new-sale-dialog';
import { useState, useMemo } from 'react';


export default function DashboardPage() {
  const [salesData, setSalesData] = useState<Sale[]>(initialSales);
  const [corretoresData, setCorretoresData] = useState<Corretor[]>(initialCorretores);
  
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

  const completedSales = salesData.filter((sale) => sale.status === 'Pago');
  const cancelledSales = salesData.filter((sale) => sale.status === 'Caiu');

  const totalSalesValue = completedSales.reduce(
    (acc, sale) => acc + sale.saleValue,
    0
  );

  const totalCommissions = completedSales.reduce(
    (acc, sale) => acc + sale.commission,
    0
  );

  const salesThisMonth = salesData.filter((sale) =>
    isThisMonth(new Date(sale.saleDate))
  ).length;

  const totalClosedDeals = completedSales.length + cancelledSales.length;
  const conversionRate =
    totalClosedDeals > 0
      ? (completedSales.length / totalClosedDeals) * 100
      : 0;

  const attentionSales = salesData.filter((sale) => sale.status === 'Pendente');

  const corretoresMap = useMemo(() => {
    return corretoresData.reduce((acc, corretor) => {
        acc[corretor.id] = corretor;
        return acc;
    }, {} as Record<string, Corretor>);
  }, [corretoresData]);

  if (salesData.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center md:gap-8 md:p-8">
        <div className="flex flex-col items-center gap-2">
          <FileText className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Nenhuma venda registrada</h2>
          <p className="text-muted-foreground">
            Clique em 'Nova Venda' para começar a registrar suas vendas e ver
            seus resultados.
          </p>
          <div className="mt-4">
            <NewSaleDialog onSaleSubmit={addOrUpdateSale} corretores={corretoresData} />
          </div>
        </div>
      </main>
    );
  }

  const chartData = useMemo(() => {
     const salesByBuilder = completedSales.reduce((acc, sale) => {
      const builder = sale.construtora;
      if (!acc[builder]) {
        acc[builder] = 0;
      }
      acc[builder] += sale.saleValue;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(salesByBuilder).map(([name, sales]) => ({ name, sales }));
  }, [completedSales]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <KpiCard
          title="Vendas Totais"
          value={formatCurrency(totalSalesValue)}
          icon={<DollarSign />}
        />
        <KpiCard
          title="Total de Comissões"
          value={formatCurrency(totalCommissions)}
          icon={<TrendingUp />}
        />
        <KpiCard
          title="Vendas no Mês"
          value={salesThisMonth.toString()}
          icon={<BarChart />}
        />
        <KpiCard
          title="Taxa de Conversão"
          value={`${conversionRate.toFixed(1)}%`}
          icon={<Activity />}
        />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesChart data={chartData} />
        </div>
        <div>
          <AttentionList sales={attentionSales} corretoresMap={corretoresMap} />
        </div>
      </div>
    </main>
  );
}

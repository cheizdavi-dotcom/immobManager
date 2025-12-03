'use client';
import { sales } from '@/lib/data';
import type { Sale } from '@/lib/types';
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

export default function DashboardPage() {
  // NOTE: This is a client component, but we'll re-evaluate data fetching
  // once we connect to a real database. For now, we use the mock data.
  const completedSales = sales.filter((sale) => sale.status === 'Pago');
  const cancelledSales = sales.filter((sale) => sale.status === 'Caiu');

  const totalSalesValue = completedSales.reduce(
    (acc, sale) => acc + sale.saleValue,
    0
  );

  const totalCommissions = completedSales.reduce(
    (acc, sale) => acc + sale.commission,
    0
  );

  const salesThisMonth = sales.filter((sale) =>
    isThisMonth(new Date(sale.saleDate))
  ).length;

  const totalClosedDeals = completedSales.length + cancelledSales.length;
  const conversionRate =
    totalClosedDeals > 0
      ? (completedSales.length / totalClosedDeals) * 100
      : 0;

  const attentionSales = sales.filter((sale) => sale.status === 'Pendente');

  if (sales.length === 0) {
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
            <NewSaleDialog />
          </div>
        </div>
      </main>
    );
  }

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
          {/* Chart needs builder data which is not in the new Sale model */}
          {/* <SalesChart data={chartData} /> */}
        </div>
        <div>
          <AttentionList sales={attentionSales} />
        </div>
      </div>
    </main>
  );
}

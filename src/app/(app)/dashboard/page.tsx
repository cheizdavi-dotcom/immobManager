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
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const completedSales = sales.filter(
    (sale) => sale.status === 'Venda Concluída / Paga'
  );
  const cancelledSales = sales.filter(
    (sale) => sale.status === 'Venda Caída / Cancelada'
  );
  
  const totalSalesValue = completedSales.reduce(
    (acc, sale) => acc + sale.saleValue,
    0
  );
  
  const totalCommissions = totalSalesValue * 0.05; // Assuming 5% commission
  
  const salesThisMonth = sales.filter((sale) =>
    isThisMonth(new Date(sale.saleDate))
  ).length;

  const totalClosedDeals = completedSales.length + cancelledSales.length;
  const conversionRate =
    totalClosedDeals > 0
      ? (completedSales.length / totalClosedDeals) * 100
      : 0;

  const salesByBuilder = sales.reduce((acc, sale) => {
    const builder = sale.builder;
    if (!acc[builder]) {
      acc[builder] = { sales: 0 };
    }
    if (sale.status === 'Venda Concluída / Paga') {
      acc[builder].sales += sale.saleValue;
    }
    return acc;
  }, {} as Record<string, { sales: number }>);

  const chartData = Object.entries(salesByBuilder).map(([name, data]) => ({
    name,
    ...data,
  }));

  const attentionSales = sales.filter(
    (sale) => sale.status === 'Em Análise de Crédito'
  );

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
          <AttentionList sales={attentionSales} />
        </div>
      </div>
    </main>
  );
}

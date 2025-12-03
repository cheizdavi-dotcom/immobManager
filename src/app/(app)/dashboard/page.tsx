'use client';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Sale, Corretor } from '@/lib/types';
import { sales as initialSales, corretores as initialCorretores } from '@/lib/data';
import { useMemo } from 'react';
import { KpiCard } from '@/components/kpi-card';
import { DollarSign, TrendingUp, CheckCircle, Clock, Percent, Users, Building, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrokerRankingChart } from '@/components/broker-ranking-chart';
import { BuilderMixChart } from '@/components/builder-mix-chart';
import { AttentionList } from '@/components/attention-list';
import { isAfter, subDays } from 'date-fns';

export default function DashboardPage() {
    const [sales] = useLocalStorage<Sale[]>('sales', initialSales);
    const [corretores] = useLocalStorage<Corretor[]>('corretores', initialCorretores);

    const {
        vgvTotal,
        comissoesPagas,
        comissoesPendentes,
        conversionRate,
    } = useMemo(() => {
        const completedSales = sales.filter(s => s.status === 'Pago');
        
        const vgvTotal = completedSales.reduce((acc, s) => acc + s.saleValue, 0);
        
        const comissoesPagas = completedSales
            .filter(s => s.commissionStatus === 'Pago')
            .reduce((acc, s) => acc + s.commission, 0);

        const comissoesPendentes = completedSales
            .filter(s => s.commissionStatus === 'Pendente')
            .reduce((acc_1, s_1) => acc_1 + s_1.commission, 0);
        
        const totalClosedDeals = sales.filter(s => s.status === 'Pago' || s.status === 'Caiu').length;
        const conversionRate = totalClosedDeals > 0 ? (completedSales.length / totalClosedDeals) * 100 : 0;

        return { vgvTotal, comissoesPagas, comissoesPendentes, conversionRate };
    }, [sales]);

    const brokerRankingData = useMemo(() => {
        if (sales.length === 0 || corretores.length === 0) return [];
        const salesByBroker = sales
            .filter(s => s.status === 'Pago')
            .reduce((acc, sale) => {
                if (!acc[sale.corretorId]) {
                    acc[sale.corretorId] = 0;
                }
                acc[sale.corretorId] += sale.saleValue;
                return acc;
        }, {} as Record<string, number>);

        const corretoresMap = corretores.reduce((acc, c) => {
            acc[c.id] = c.name;
            return acc;
        }, {} as Record<string, string>);

        return Object.entries(salesByBroker)
            .map(([brokerId, total]) => ({
                name: corretoresMap[brokerId] || 'Desconhecido',
                total,
            }))
            .sort((a,b) => b.total - a.total)
            .slice(0, 5);
    }, [sales, corretores]);

    const builderMixData = useMemo(() => {
        if (sales.length === 0) return [];
        const salesByBuilder = sales
            .filter(s => s.status === 'Pago')
            .reduce((acc, sale) => {
                const builder = sale.construtora;
                if (!acc[builder]) {
                    acc[builder] = { name: builder, value: 0 };
                }
                acc[builder].value += sale.saleValue;
                return acc;
        }, {} as Record<string, {name: string, value: number}>);

        return Object.values(salesByBuilder);
    }, [sales]);

    const attentionSales = useMemo(() => {
        const sevenDaysAgo = subDays(new Date(), 7);
        return sales.filter(sale => 
            (sale.status === 'Pendente') &&
            isAfter(sevenDaysAgo, new Date(sale.saleDate))
        );
    }, [sales]);

     const corretoresMap = useMemo(() => {
        return corretores.reduce((acc, corretor) => {
            acc[corretor.id] = corretor;
            return acc;
        }, {} as Record<string, Corretor>);
    }, [corretores]);


    if (sales.length === 0) {
        return (
            <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center md:gap-8 md:p-8">
                 <div className="flex flex-col items-center gap-2">
                    <TrendingUp className="h-16 w-16 text-muted-foreground" />
                    <h2 className="text-2xl font-semibold">Dashboard Aguardando Dados</h2>
                    <p className="max-w-md text-muted-foreground">
                        Assim que você registrar a primeira venda, seus indicadores, gráficos e insights aparecerão aqui.
                    </p>
                </div>
            </main>
        );
    }


    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
             <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <KpiCard
                    title="VGV Total (Vendas Pagas)"
                    value={formatCurrency(vgvTotal)}
                    icon={<DollarSign />}
                />
                <KpiCard
                    title="Comissões Pendentes"
                    value={formatCurrency(comissoesPendentes)}
                    icon={<Clock className="text-yellow-500" />}
                />
                <KpiCard
                    title="Comissões Pagas"
                    value={formatCurrency(comissoesPagas)}
                    icon={<CheckCircle className="text-green-500" />}
                />
                <KpiCard
                    title="Taxa de Conversão"
                    value={`${conversionRate.toFixed(1)}%`}
                    icon={<Percent />}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <BrokerRankingChart data={brokerRankingData} />
                </div>
                <div className="lg:col-span-2">
                    <BuilderMixChart data={builderMixData} />
                </div>
            </div>

            <div>
                <AttentionList sales={attentionSales} corretoresMap={corretoresMap} />
            </div>

        </main>
    );
}

    
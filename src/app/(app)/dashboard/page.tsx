'use client';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Sale, Corretor, Client, Development } from '@/lib/types';
import { sales as initialSales, corretores as initialCorretores, clients as initialClients, developments as initialDevelopments, getSalesStorageKey, getCorretoresStorageKey, getClientsStorageKey, getDevelopmentsStorageKey } from '@/lib/data';
import { useMemo } from 'react';
import { KpiCard } from '@/components/kpi-card';
import { DollarSign, TrendingUp, CheckCircle, Clock, Percent, Users, Building, AlertTriangle, CalendarClock, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrokerRankingChart } from '@/components/broker-ranking-chart';
import { BuilderMixChart } from '@/components/builder-mix-chart';
import { AttentionList } from '@/components/attention-list';
import { AgendaWidget } from '@/components/agenda-widget';
import { isAfter, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useAuth } from '@/hooks/useAuth.tsx';

export default function DashboardPage() {
    const { user } = useAuth();
    const userEmail = user?.email || '';

    const [sales] = useLocalStorage<Sale[]>(getSalesStorageKey(userEmail), initialSales);
    const [corretores] = useLocalStorage<Corretor[]>(getCorretoresStorageKey(userEmail), initialCorretores);
    const [clients] = useLocalStorage<Client[]>(getClientsStorageKey(userEmail), initialClients);
    const [developments] = useLocalStorage<Development[]>(getDevelopmentsStorageKey(userEmail), initialDevelopments);

    const {
        faturamentoVendasPagas,
        vgvPipelineAtivo,
        comissoesPagas,
        comissoesPendentes,
        conversionRate,
    } = useMemo(() => {
        const activeSales = sales?.filter(s => s.status !== 'Venda Cancelada / Caiu') || [];
        const completedSales = sales?.filter(s => s.status === 'Venda Concluída / Paga') || [];
        
        const faturamentoVendasPagas = completedSales.reduce((acc, s) => acc + (s.saleValue || 0), 0);
        const vgvPipelineAtivo = activeSales.reduce((acc, s) => acc + (s.saleValue || 0), 0);
        
        const comissoesPagas = activeSales
            .filter(s => s.commissionStatus === 'Pago')
            .reduce((acc, s) => acc + (s.commission || 0), 0);

        const comissoesPendentes = activeSales
            .filter(s => s.commissionStatus === 'Pendente')
            .reduce((acc, s) => acc + (s.commission || 0), 0);
        
        const totalClosedDeals = sales?.filter(s => s.status === 'Venda Concluída / Paga' || s.status === 'Venda Cancelada / Caiu').length || 0;
        const conversionRate = totalClosedDeals > 0 ? (completedSales.length / totalClosedDeals) * 100 : 0;

        return { faturamentoVendasPagas, vgvPipelineAtivo, comissoesPagas, comissoesPendentes, conversionRate };
    }, [sales]);

    const brokerRankingData = useMemo(() => {
        if (!sales || sales.length === 0 || !corretores || corretores.length === 0) return [];
        const salesByBroker = sales
            .filter(s => s.status === 'Venda Concluída / Paga')
            .reduce((acc, sale) => {
                if (!acc[sale.corretorId]) {
                    acc[sale.corretorId] = 0;
                }
                acc[sale.corretorId] += (sale.saleValue || 0);
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
        if (!sales || sales.length === 0) return [];

        const salesByBuilder = sales
            .filter(s => s.status === 'Venda Concluída / Paga')
            .reduce((acc, sale) => {
                const builder = sale.construtora;
                if (!acc[builder]) {
                    acc[builder] = { name: builder, value: 0 };
                }
                acc[builder].value += (sale.saleValue || 0);
                return acc;
        }, {} as Record<string, {name: string, value: number}>);

        return Object.values(salesByBuilder);
    }, [sales]);

    const attentionSales = useMemo(() => {
        if (!sales) return [];
        const sevenDaysAgo = subDays(new Date(), 7);
        return sales.filter(sale => 
            (sale.status === 'Análise de Crédito / SPC' || sale.status === 'Aguardando Assinatura' || sale.status === 'Aguardando Pagamento Ato') &&
            sale.saleDate && new Date(sale.saleDate) < sevenDaysAgo
        );
    }, [sales]);

     const corretoresMap = useMemo(() => {
        if (!corretores) return {};
        return corretores.reduce((acc, corretor) => {
            acc[corretor.id] = corretor;
            return acc;
        }, {} as Record<string, Corretor>);
    }, [corretores]);

    const clientsMap = useMemo(() => {
        if (!clients) return {};
        return clients.reduce((acc, client) => {
            acc[client.id] = client;
            return acc;
        }, {} as Record<string, Client>);
    }, [clients]);

     const developmentsMap = useMemo(() => {
        if (!developments) return {};
        return developments.reduce((acc, dev) => {
            acc[dev.id] = dev;
            return acc;
        }, {} as Record<string, Development>);
    }, [developments]);


    if (!sales || sales.length === 0 && (!clients || clients.length === 0)) {
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
             <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
                <KpiCard
                    title="Faturamento (Vendas Pagas)"
                    value={formatCurrency(faturamentoVendasPagas)}
                    icon={<DollarSign />}
                />
                 <KpiCard
                    title="VGV Pipeline (Ativo)"
                    value={formatCurrency(vgvPipelineAtivo)}
                    icon={<Package />}
                />
                <KpiCard
                    title="Comissões a Pagar"
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

            <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 grid grid-cols-1 gap-4 md:gap-8">
                    <BrokerRankingChart data={brokerRankingData} />
                    <BuilderMixChart data={builderMixData} />
                </div>
                <div className="lg:col-span-1 grid grid-cols-1 gap-4 md:gap-8">
                     <AgendaWidget sales={sales || []} clientsMap={clientsMap} />
                     <AttentionList sales={attentionSales} corretoresMap={corretoresMap} clientsMap={clientsMap} developmentsMap={developmentsMap} />
                </div>
            </div>

        </main>
    );
}

'use client';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Sale, Corretor, Client, Development } from '@/lib/types';
import { useMemo } from 'react';
import { KpiCard } from '@/components/kpi-card';
import { DollarSign, TrendingUp, CheckCircle, Clock, Percent, Package, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { BrokerRankingChart } from '@/components/broker-ranking-chart';
import { BuilderMixChart } from '@/components/builder-mix-chart';
import { AttentionList } from '@/components/attention-list';
import { AgendaWidget } from '@/components/agenda-widget';
import { subDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const salesQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return query(collection(firestore, 'sales'), where('userId', '==', user.uid));
    }, [firestore, user?.uid]);
    const { data: sales, isLoading: isLoadingSales } = useCollection<Sale>(salesQuery);

    const corretoresQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return query(collection(firestore, 'corretores'), where('userId', '==', user.uid));
    }, [firestore, user?.uid]);
    const { data: corretores, isLoading: isLoadingCorretores } = useCollection<Corretor>(corretoresQuery);

    const clientsQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return query(collection(firestore, 'clients'), where('userId', '==', user.uid));
    }, [firestore, user?.uid]);
    const { data: clients, isLoading: isLoadingClients } = useCollection<Client>(clientsQuery);
    
    const developmentsQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return query(collection(firestore, 'developments'), where('userId', '==', user.uid));
    }, [firestore, user?.uid]);
    const { data: developments, isLoading: isLoadingDevs } = useCollection<Development>(developmentsQuery);

    const isLoading = isLoadingSales || isLoadingCorretores || isLoadingClients || isLoadingDevs;

    const {
        faturamentoVendasPagas,
        vgvPipelineAtivo,
        comissoesPagas,
        comissoesPendentes,
        conversionRate,
    } = useMemo(() => {
        if (!sales) {
          return { faturamentoVendasPagas: 0, vgvPipelineAtivo: 0, comissoesPagas: 0, comissoesPendentes: 0, conversionRate: 0 };
        }
        
        const activeSales = sales.filter(s => s.status !== 'Venda Cancelada / Caiu');
        const completedSales = sales.filter(s => s.status === 'Venda Concluída / Paga');
        
        const faturamentoVendasPagas = completedSales.reduce((acc, s) => acc + (s.saleValue || 0), 0);
        const vgvPipelineAtivo = activeSales.reduce((acc, s) => acc + (s.saleValue || 0), 0);
        
        const comissoesPagas = activeSales
            .filter(s => s.commissionStatus === 'Pago')
            .reduce((acc, s) => acc + (s.commission || 0), 0);

        const comissoesPendentes = activeSales
            .filter(s => s.commissionStatus === 'Pendente')
            .reduce((acc, s) => acc + (s.commission || 0), 0);
        
        const totalClosedDeals = sales.filter(s => s.status === 'Venda Concluída / Paga' || s.status === 'Venda Cancelada / Caiu').length;
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

    if (isLoading) {
       return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
             <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[108px] w-full" />)}
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 grid grid-cols-1 gap-4 md:gap-8">
                    <Skeleton className="h-[430px] w-full" />
                    <Skeleton className="h-[430px] w-full" />
                </div>
                <div className="lg:col-span-1 grid grid-cols-1 gap-4 md:gap-8">
                     <Skeleton className="h-[400px] w-full" />
                     <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        </main>
       )
    }


    if (!sales || sales.length === 0) {
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

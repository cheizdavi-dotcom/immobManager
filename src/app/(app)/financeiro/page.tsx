'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from '@/components/kpi-card';
import { Banknote, CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { sales as initialSales, corretores as initialCorretores, clients as initialClients, developments as initialDevelopments } from '@/lib/data';
import type { Sale, Corretor, CommissionStatus, Client, Development } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cva } from 'class-variance-authority';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useMemo } from 'react';


const commissionStatusBadgeVariants = cva('capitalize font-semibold cursor-pointer text-xs border', {
  variants: {
    status: {
      Pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
      Pago: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    },
  },
});

const saleStatusBadgeVariants = cva('capitalize font-semibold text-xs border', {
  variants: {
    status: {
      Pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Pago: 'bg-green-100 text-green-800 border-green-200',
      Caiu: 'bg-red-100 text-red-800 border-red-200',
    },
  },
  defaultVariants: {
    status: 'Pendente',
  },
});

export default function FinanceiroPage() {
    const [sales, setSales] = useLocalStorage<Sale[]>('sales', initialSales);
    const [corretores] = useLocalStorage<Corretor[]>('corretores', initialCorretores);
    const [clients] = useLocalStorage<Client[]>('clients', initialClients);
    const [developments] = useLocalStorage<Development[]>('developments', initialDevelopments);
    const { toast } = useToast();

    const financialMetrics = useMemo(() => {
        const completedSales = sales.filter(s => s.status === 'Pago');
        
        const faturamentoTotal = completedSales.reduce((acc, s) => acc + (s.saleValue || 0), 0);
        
        const comissoesPagas = completedSales
            .filter(s => s.commissionStatus === 'Pago')
            .reduce((acc, s) => acc + (s.commission || 0), 0);

        const comissoesPendentes = sales
            .filter(s => s.status === 'Pago' && s.commissionStatus === 'Pendente')
            .reduce((acc, s) => acc + (s.commission || 0), 0);
        
        const lucroBruto = faturamentoTotal - comissoesPagas - comissoesPendentes;
        
        return { faturamentoTotal, comissoesPagas, comissoesPendentes, lucroBruto };
    }, [sales]);

    const { faturamentoTotal, comissoesPagas, comissoesPendentes, lucroBruto } = financialMetrics;

    const commissionsToDisplay = useMemo(() => {
        return sales
            .filter(s => s.commission > 0)
            .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
    }, [sales]);

    const getCorretorName = (corretorId: string) => {
        return corretores.find(c => c.id === corretorId)?.name || 'N/A';
    }
    const getClientName = (clientId: string) => {
        return clients.find(c => c.id === clientId)?.name || 'N/A';
    }

    const toggleCommissionStatus = (saleId: string, currentStatus: CommissionStatus) => {
        const sale = sales.find(s => s.id === saleId);
        if (sale?.status === 'Caiu') {
             toast({
                variant: "destructive",
                title: "Ação Bloqueada",
                description: `Não é possível pagar comissão de uma venda cancelada.`
            });
            return;
        }

        const newStatus: CommissionStatus = currentStatus === 'Pendente' ? 'Pago' : 'Pendente';
        setSales(prevSales => 
            prevSales.map(s => 
                s.id === saleId ? { ...s, commissionStatus: newStatus } : s
            )
        );
        toast({
            title: "Status da Comissão Alterado!",
            description: `A comissão foi marcada como ${newStatus.toLowerCase()}.`
        })
    };


    if (sales.length === 0) {
        return (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center md:gap-8 md:p-8">
            <div className="flex flex-col items-center gap-2">
            <Banknote className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Nenhum dado financeiro</h2>
            <p className="text-muted-foreground">
                As informações financeiras de vendas cadastradas aparecerão aqui.
            </p>
            </div>
        </main>
        );
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
                <p className="text-muted-foreground">Acompanhe o fluxo de caixa da sua operação.</p>
            </div>
        </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <KpiCard
                title="Faturamento (Vendas Pagas)"
                value={formatCurrency(faturamentoTotal)}
                icon={<DollarSign />}
            />
            <KpiCard
                title="Comissões Pagas"
                value={formatCurrency(comissoesPagas)}
                icon={<CheckCircle className="text-green-500" />}
            />
            <KpiCard
                title="Comissões Pendentes"
                value={formatCurrency(comissoesPendentes)}
                icon={<Clock className="text-yellow-500" />}
            />
             <KpiCard
                title="Lucro Bruto (A Receber)"
                value={formatCurrency(lucroBruto)}
                icon={<TrendingUp />}
            />
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Controle de Comissões</CardTitle>
            <CardDescription>Gerencie o status de pagamento das comissões de cada venda cadastrada.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow className='hover:bg-card'>
                        <TableHead>Data Venda</TableHead>
                        <TableHead>Corretor</TableHead>
                        <TableHead>Referente à Venda</TableHead>
                        <TableHead>Status da Venda</TableHead>
                        <TableHead className="text-right">Valor Comissão</TableHead>
                        <TableHead className="text-center pr-6">Status Pagamento</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {commissionsToDisplay.map(sale => (
                        <TableRow 
                            key={sale.id}
                            className={cn('border-x-0', sale.status === 'Caiu' && 'bg-muted/50 text-muted-foreground line-through')}
                        >
                            <TableCell>{format(new Date(sale.saleDate), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{getCorretorName(sale.corretorId)}</TableCell>
                            <TableCell>
                                <div className="font-medium">{developments.find(d => d.id === sale.developmentId)?.name || 'N/A'}</div>
                                <div className={cn("text-sm", sale.status !== 'Caiu' ? "text-muted-foreground" : "text-inherit")}>{getClientName(sale.clientId)}</div>
                            </TableCell>
                            <TableCell>
                                <Badge className={saleStatusBadgeVariants({status: sale.status})}>{sale.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(sale.commission)}</TableCell>
                            <TableCell className="text-center">
                                <Badge 
                                    className={commissionStatusBadgeVariants({status: sale.commissionStatus})}
                                    onClick={() => toggleCommissionStatus(sale.id, sale.commissionStatus)}
                                >
                                    {sale.commissionStatus}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

    </main>
  );
}

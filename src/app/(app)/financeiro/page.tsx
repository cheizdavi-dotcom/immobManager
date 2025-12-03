'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from '@/components/kpi-card';
import { Banknote, CheckCircle, Clock, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { sales as initialSales, corretores as initialCorretores } from '@/lib/data';
import type { Sale, Corretor, CommissionStatus } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cva } from 'class-variance-authority';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const commissionStatusBadgeVariants = cva('capitalize font-semibold cursor-pointer', {
  variants: {
    status: {
      Pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
      Pago: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    },
  },
});

export default function FinanceiroPage() {
    const [sales, setSales] = useState<Sale[]>(initialSales);
    const [corretores] = useState<Corretor[]>(initialCorretores);
    const { toast } = useToast();

    const faturamentoTotal = sales
        .filter(s => s.status === 'Pago')
        .reduce((acc, s) => acc + s.saleValue, 0);
    
    const comissoesPagas = sales
        .filter(s => s.commissionStatus === 'Pago')
        .reduce((acc, s) => acc + s.commission, 0);

    const comissoesPendentes = sales
        .filter(s => s.commissionStatus === 'Pendente')
        .reduce((acc, s) => acc + s.commission, 0);
    
    const lucroBruto = faturamentoTotal - comissoesPagas - comissoesPendentes;

    const getCorretorName = (corretorId: string) => {
        return corretores.find(c => c.id === corretorId)?.name || 'N/A';
    }

    const toggleCommissionStatus = (saleId: string, currentStatus: CommissionStatus) => {
        const newStatus: CommissionStatus = currentStatus === 'Pendente' ? 'Pago' : 'Pendente';
        setSales(prevSales => 
            prevSales.map(sale => 
                sale.id === saleId ? { ...sale, commissionStatus: newStatus } : sale
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
                As informações financeiras aparecerão aqui quando novas vendas forem registradas.
            </p>
            </div>
        </main>
        );
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <KpiCard
                title="Faturamento Total"
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
                title="Lucro Bruto (Estimado)"
                value={formatCurrency(lucroBruto)}
                icon={<TrendingUp />}
            />
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Controle de Comissões</CardTitle>
            <CardDescription>Gerencie o status de pagamento das comissões de cada venda.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Data Venda</TableHead>
                        <TableHead>Corretor</TableHead>
                        <TableHead>Referente à Venda</TableHead>
                        <TableHead className="text-right">Valor Comissão</TableHead>
                        <TableHead className="text-center">Status Pagamento</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sales.map(sale => (
                        <TableRow key={sale.id}>
                            <TableCell>{format(new Date(sale.saleDate), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{getCorretorName(sale.corretorId)}</TableCell>
                            <TableCell>
                                <div className="font-medium">{sale.empreendimento}</div>
                                <div className="text-sm text-muted-foreground">{sale.clientName}</div>
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

import type { Sale, Client, Development } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { User } from 'lucide-react';
import { cva } from 'class-variance-authority';

type KanbanCardProps = {
  sale: Sale;
  corretorName: string;
  clientName: string;
  developmentName: string;
};

const statusBorderVariants = cva('hover:shadow-md transition-shadow border-l-4', {
  variants: {
    status: {
      'Proposta / Cadastro': 'border-gray-300',
      'Análise de Crédito / SPC': 'border-orange-400',
      'Aguardando Assinatura': 'border-blue-400',
      'Aguardando Pagamento Ato': 'border-yellow-400',
      'Venda Concluída / Paga': 'border-green-500',
      'Venda Cancelada / Caiu': 'border-red-500',
    },
  },
});


export function KanbanCard({ sale, corretorName, clientName, developmentName }: KanbanCardProps) {
  return (
    <Card className={statusBorderVariants({ status: sale.status })}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
            <CardTitle className="text-base font-semibold leading-tight">{clientName}</CardTitle>
             <Badge variant="secondary">
                {developmentName}
            </Badge>
        </div>
        <p className="text-sm text-muted-foreground pt-1 flex items-center gap-1">
          <User className="w-3 h-3"/>
          {corretorName}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm space-y-2">
        <div className="flex items-center justify-between text-muted-foreground">
            <span>Valor da Venda:</span>
            <span className="font-semibold text-foreground">{formatCurrency(sale.saleValue)}</span>
        </div>
         <div className="flex items-center justify-between text-muted-foreground">
            <span>Comissão:</span>
            <span className="font-semibold text-green-600 flex items-center gap-1">
                {formatCurrency(sale.commission)}
            </span>
        </div>
      </CardContent>
    </Card>
  );
}

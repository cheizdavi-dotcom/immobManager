import type { Sale } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { User, Building } from 'lucide-react';
import { cva } from 'class-variance-authority';

type KanbanCardProps = {
  sale: Sale;
};

const badgeVariants = cva('text-xs font-semibold', {
  variants: {
    builder: {
      Tenda: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
      Vasco: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800',
      MRV: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
      Outra: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    },
  },
  defaultVariants: {
    builder: 'Outra',
  },
});


export function KanbanCard({ sale }: KanbanCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
            <CardTitle className="text-base font-semibold leading-tight">{sale.clientName}</CardTitle>
            <Badge variant="outline" className={badgeVariants({ builder: sale.builder })}>
                {sale.builder}
            </Badge>
        </div>
        <p className="text-sm text-muted-foreground pt-1">{sale.project}</p>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm space-y-2">
        <div className="flex items-center justify-between text-muted-foreground">
            <span>Valor do Ato:</span>
            <span className="font-semibold text-foreground">{formatCurrency(sale.downPayment)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
            <span>Corretor:</span>
            <span className="font-semibold text-foreground flex items-center gap-1">
                <User className="w-3 h-3"/>
                {sale.agentName}
            </span>
        </div>
      </CardContent>
    </Card>
  );
}

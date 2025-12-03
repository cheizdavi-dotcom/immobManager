'use client';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';
import { Building } from 'lucide-react';

type ChartData = {
    name: string;
    value: number;
}[];

type BuilderMixChartProps = {
  data: ChartData;
};

const COLORS = [
    'hsl(var(--chart-1))', 
    'hsl(var(--chart-2))', 
    'hsl(var(--chart-3))', 
    'hsl(var(--chart-4))', 
    'hsl(var(--chart-5))'
];

export function BuilderMixChart({ data }: BuilderMixChartProps) {
  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as any);

  if (data.length === 0) {
     return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Building className="h-6 w-6" />
                    <CardTitle>Mix de Construtoras</CardTitle>
                </div>
                <CardDescription>Distribuição do VGV por construtora.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex h-[350px] w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
                    <p className="text-muted-foreground">Sem dados para exibir o gráfico.</p>
                </div>
            </CardContent>
        </Card>
    );
  }

  const totalValue = data.reduce((acc, entry) => acc + entry.value, 0);

  return (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <Building className="h-6 w-6" />
                <CardTitle>Mix de Construtoras</CardTitle>
            </div>
            <CardDescription>Distribuição do VGV por construtora.</CardDescription>
        </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={<ChartTooltipContent
                  formatter={(value, name) => `${formatCurrency(value as number)} (${((value as number / totalValue) * 100).toFixed(1)}%)`}
                  nameKey="name"
                />}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                strokeWidth={5}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

    
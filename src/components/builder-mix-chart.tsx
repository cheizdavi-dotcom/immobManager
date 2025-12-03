'use client';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts';
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
import { useMemo } from 'react';

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
  const chartConfig = useMemo(() => {
    return data.reduce((acc, item) => {
        acc[item.name] = {
            label: item.name,
            color: COLORS[Object.keys(acc).length % COLORS.length],
        };
        return acc;
    }, {} as any);
  }, [data]);
  
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
      <CardContent className='pb-0'>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => `${formatCurrency(value as number)} (${((value as number / totalValue) * 100).toFixed(1)}%)`}
                />}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={80}
                outerRadius={110}
                strokeWidth={5}
                isAnimationActive={true}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
       <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 p-4 text-sm text-muted-foreground">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            {item.name}
          </div>
        ))}
      </div>
    </Card>
  );
}

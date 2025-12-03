'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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
import { Users } from 'lucide-react';

type ChartData = {
    name: string;
    total: number;
}[];

type BrokerRankingChartProps = {
  data: ChartData;
};

export function BrokerRankingChart({ data }: BrokerRankingChartProps) {
  const chartConfig = {
    total: {
      label: 'Vendido',
      color: 'hsl(var(--primary))',
    },
  };

  if (data.length === 0) {
    return (
         <Card className="lg:col-span-3">
            <CardHeader>
                 <div className="flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    <CardTitle>Ranking de Corretores</CardTitle>
                </div>
                <CardDescription>Top 5 corretores por valor total vendido.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex h-[350px] w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
                    <p className="text-muted-foreground">Sem dados para exibir o ranking.</p>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                <CardTitle>Ranking de Corretores</CardTitle>
            </div>
            <CardDescription>Top 5 corretores por valor total vendido.</CardDescription>
        </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tick={{ fill: 'hsl(var(--foreground))' }}
                width={80}

              />
              <XAxis
                dataKey="total"
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value as number).slice(0,-3)}
              />
               <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={<ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

    
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
  ChartContainer
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
      color: 'hsl(var(--chart-1))',
    },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-1 gap-1">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-bold text-foreground">{label}</span>
              <span className="text-sm text-muted-foreground">
                Total: <span className="font-mono font-medium tabular-nums text-foreground">{formatCurrency(payload[0].value)}</span>
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
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
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }} barCategoryGap="20%">
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
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
                content={<CustomTooltip />}
              />
              <Bar dataKey="total" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} isAnimationActive={true}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

type OverviewProps = {
  transactions: Transaction[];
};

export default function Overview({ transactions }: OverviewProps) {
  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    for (const t of transactions) {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
      }
    }
    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
  }, [transactions]);

  const chartData = [
    { name: 'Summary', income: totalIncome, expenses: totalExpenses },
  ];

  const chartConfig = {
    income: {
      label: 'Income',
      color: 'hsl(var(--primary))',
    },
    expenses: {
      label: 'Expenses',
      color: 'hsl(var(--destructive))',
    },
  } satisfies ChartConfig;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">from {transactions.filter(t => t.type === 'income').length} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">from {transactions.filter(t => t.type === 'expense').length} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">Your current financial standing</p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-8">
        <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>A summary of your total income and expenses.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={chartData} barSize={60}>
                <CartesianGrid vertical={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(Number(value))} />
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent
                        formatter={(value) => formatCurrency(Number(value))}
                        labelClassName="font-bold"
                    />}
                />
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
              </BarChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

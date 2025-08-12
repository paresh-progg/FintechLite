'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieChartIcon } from 'lucide-react';

type OverviewProps = {
  transactions: Transaction[];
};

const COLORS = ["#5A7DA6", "#468A8F", "#8884d8", "#FF8042", "#00C49F", "#FFBB28"];

export default function Overview({ transactions }: OverviewProps) {
  const { totalIncome, totalExpenses, balance, expenseByCategory } = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    const expenseByCategory: { [key: string]: number } = {};

    for (const t of transactions) {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      }
    }
    return { 
      totalIncome, 
      totalExpenses, 
      balance: totalIncome - totalExpenses,
      expenseByCategory: Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
    };
  }, [transactions]);

  const summaryChartData = [
    { name: 'Summary', income: totalIncome, expenses: totalExpenses },
  ];

  const summaryChartConfig = {
    income: {
      label: 'Income',
      color: 'hsl(var(--primary))',
    },
    expenses: {
      label: 'Expenses',
      color: 'hsl(var(--destructive))',
    },
  } satisfies ChartConfig;

  const expenseChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    expenseByCategory.forEach((item, index) => {
      config[item.name] = {
        label: item.name,
        color: COLORS[index % COLORS.length]
      }
    });
    return config;
  }, [expenseByCategory]);


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
      <div className="grid gap-8 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>A summary of your total income and expenses.</CardDescription>
          </CardHeader>
          <CardContent>
              <ChartContainer config={summaryChartConfig} className="min-h-[250px] w-full">
                <BarChart accessibilityLayer data={summaryChartData} barSize={80}>
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
        <Card>
            <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>How your spending is distributed across categories.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={expenseChartConfig} className="min-h-[250px] w-full">
                    {expenseByCategory.length > 0 ? (
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent
                                    formatter={(value, name) => `${formatCurrency(Number(value))} (${((Number(value) / totalExpenses) * 100).toFixed(1)}%)`}
                                    nameKey="name"
                                    labelClassName="font-bold"
                                />}
                            />
                            <Pie
                                data={expenseByCategory}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={60}
                                paddingAngle={2}
                                labelLine={false}
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                    return (
                                        <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
                                            {expenseByCategory[index].name}
                                        </text>
                                    );
                                }}
                            >
                                {expenseByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <PieChartIcon className="h-12 w-12 mb-2" />
                            <p>No expense data to display.</p>
                        </div>
                    )}
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

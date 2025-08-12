'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import type { Transaction, Budget } from '@/lib/types';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieChartIcon, Target } from 'lucide-react';

type OverviewProps = {
  transactions: Transaction[];
  budgets: Budget[];
};

const COLORS = ["#5A7DA6", "#468A8F", "#8884d8", "#FF8042", "#00C49F", "#FFBB28"];

export default function Overview({ transactions, budgets }: OverviewProps) {
  const { totalIncome, totalExpenses, balance, expenseByCategory } = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    const expenseByCategoryMap: { [key: string]: { spent: number; budget?: number } } = {};

    for (const t of transactions) {
        if (t.type === 'income') {
            totalIncome += t.amount;
        } else {
            totalExpenses += t.amount;
            if (!expenseByCategoryMap[t.category]) {
            expenseByCategoryMap[t.category] = { spent: 0 };
            }
            expenseByCategoryMap[t.category].spent += t.amount;
        }
    }
    
    for (const b of budgets) {
        if (expenseByCategoryMap[b.category]) {
            expenseByCategoryMap[b.category].budget = b.amount;
        } else {
            // Include budgets even if there's no spending yet
            expenseByCategoryMap[b.category] = { spent: 0, budget: b.amount };
        }
    }

    return { 
      totalIncome, 
      totalExpenses, 
      balance: totalIncome - totalExpenses,
      expenseByCategory: Object.entries(expenseByCategoryMap)
        .map(([name, { spent, budget }]) => ({ name, value: spent, budget }))
        .sort((a,b) => (b.budget || 0) - (a.budget || 0)),
    };
  }, [transactions, budgets]);

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
  
  const budgetedExpenses = expenseByCategory.filter(e => e.budget && e.budget > 0);


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

      {budgetedExpenses.length > 0 && (
          <Card className="mt-8">
              <CardHeader>
                  <CardTitle>Budget Progress</CardTitle>
                  <CardDescription>How you're tracking against your monthly budgets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {budgetedExpenses.map(item => {
                    const progress = item.budget ? (item.value / item.budget) * 100 : 0;
                    return (
                      <div key={item.name}>
                          <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{item.name}</span>
                              <span className="text-sm text-muted-foreground">{formatCurrency(item.value)} / {formatCurrency(item.budget!)}</span>
                          </div>
                          <Progress value={progress} />
                      </div>
                  )})}
              </CardContent>
          </Card>
      )}

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
                    {expenseByCategory.filter(i => i.value > 0).length > 0 ? (
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent
                                    formatter={(value, name, props) => {
                                      const { budget } = props.payload.payload;
                                      const percentage = budget ? `(${(Number(value) / budget * 100).toFixed(0)}% of budget)`: `(${(Number(value) / totalExpenses * 100).toFixed(1)}%)`;
                                      return `${formatCurrency(Number(value))} ${percentage}`;
                                    }}
                                    nameKey="name"
                                    labelClassName="font-bold"
                                />}
                            />
                            <Pie
                                data={expenseByCategory.filter(i => i.value > 0)}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                innerRadius={50}
                                paddingAngle={2}
                            >
                                {expenseByCategory.filter(i => i.value > 0).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                <LabelList
                                  dataKey="name"
                                  position="outside"
                                  offset={15}
                                  className="fill-foreground text-xs"
                                  formatter={(value: string) => value}
                                />
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

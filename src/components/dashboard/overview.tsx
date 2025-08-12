'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, LabelList, Label, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import type { Transaction, Budget } from '@/lib/types';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ["hsl(262, 83%, 58%)", "hsl(340, 82%, 52%)", "hsl(217, 91%, 60%)", "hsl(142, 71%, 45%)",  "hsl(34, 91%, 60%)", "hsl(48, 96%, 58%)"];

type OverviewProps = {
  transactions: Transaction[];
  budgets: Budget[];
}

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
        .sort((a,b) => b.value - a.value),
    };
  }, [transactions, budgets]);

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
  
  const budgetedExpenses = expenseByCategory.filter(e => e.budget && e.budget > 0).sort((a,b) => (b.budget || 0) - (a.budget || 0));


  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">from {transactions.filter(t => t.type === 'income').length} transactions</p>
          </CardContent>
        </Card>
        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">from {transactions.filter(t => t.type === 'expense').length} transactions</p>
          </CardContent>
        </Card>
        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-destructive'}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">Your current financial standing</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-5 mt-8">
        <div className="md:col-span-2">
        <Card className="h-full bg-card/70 backdrop-blur-sm">
              <CardHeader>
                  <CardTitle>Budget Progress</CardTitle>
                  <CardDescription>How you're tracking against your monthly budgets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {budgetedExpenses.length > 0 ? budgetedExpenses.map(item => {
                    const progress = item.budget ? (item.value / item.budget) * 100 : 0;
                    const progressColor = progress > 100 ? "bg-destructive" : progress > 75 ? "bg-yellow-500" : "bg-primary";
                    return (
                      <div key={item.name}>
                          <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{item.name}</span>
                              <span className="text-sm text-muted-foreground">{formatCurrency(item.value)} / {formatCurrency(item.budget!)}</span>
                          </div>
                          <Progress value={Math.min(progress, 100)} className="h-2" indicatorClassName={progressColor} />
                      </div>
                  )}) : (
                    <div className="text-center text-muted-foreground py-4">
                      <p>No budgets set. Set budgets to track your spending goals.</p>
                    </div>
                  )}
              </CardContent>
          </Card>
        </div>
        <div className="md:col-span-3">
        <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>How your spending is distributed across categories.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                
                    {expenseByCategory.filter(i => i.value > 0).length > 0 ? (
                      <ChartContainer config={expenseChartConfig} className="w-full h-full">
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent
                                    formatter={(value) => `${formatCurrency(Number(value))} (${(Number(value) / totalExpenses * 100).toFixed(0)}%)`}
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
                                outerRadius="80%"
                                innerRadius="60%"
                                paddingAngle={2}
                                labelLine={false}
                            >
                                {expenseByCategory.filter(i => i.value > 0).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                <LabelList
                                  dataKey="name"
                                  position="outside"
                                  offset={12}
                                  className="fill-foreground text-xs"
                                  formatter={(value: string) => value}
                                />
                                <Label 
                                  content={({ viewBox }) => {
                                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                          return (
                                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                  <tspan x={viewBox.cx} y={viewBox.cy - 10} className="text-sm text-muted-foreground fill-current">Total</tspan>
                                                  <tspan x={viewBox.cx} y={viewBox.cy + 10} className="text-2xl font-bold fill-current">
                                                      {formatCurrency(totalExpenses)}
                                                  </tspan>
                                              </text>
                                          );
                                      }
                                      return null;
                                  }}
                                />
                            </Pie>
                        </PieChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground min-h-[300px]">
                            <PieChartIcon className="h-12 w-12 mb-2" />
                            <p>No expense data to display.</p>
                        </div>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}

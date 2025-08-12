'use client';

import { useState } from 'react';
import type { Transaction } from '@/lib/types';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import Overview from '@/components/dashboard/overview';
import TransactionTable from '@/components/dashboard/transaction-table';
import EmptyState from '@/components/dashboard/empty-state';
import { generateFinancialInsights } from '@/ai/flows/generate-financial-insights';
import type { GenerateFinancialInsightsOutput } from '@/ai/flows/generate-financial-insights';
import AddTransactionDialog from '@/components/dashboard/add-transaction-dialog';
import AIInsightsDrawer from '@/components/dashboard/ai-insights-drawer';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [insights, setInsights] = useState<GenerateFinancialInsightsOutput | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isInsightsDrawerOpen, setIsInsightsDrawerOpen] = useState(false);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions((prev) => [...prev, newTransaction].sort((a, b) => b.date.getTime() - a.date.getTime()));
    setInsights(null); // Invalidate old insights
    setIsAddDialogOpen(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setInsights(null); // Invalidate old insights
  };

  const handleGenerateInsights = async () => {
    setIsInsightsDrawerOpen(true);
    if (isLoadingInsights) return;
    setIsLoadingInsights(true);
    setInsights(null);
    try {
      const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter((t) => t.type === 'expense')
        .map(({ category, amount }) => ({ category, amount }));
      
      if (income === 0 && expenses.length === 0) {
        setInsights({ insights: "There's no data to analyze. Please add some income and expenses first to get your personalized financial insights." });
        return;
      }

      const result = await generateFinancialInsights({ income, expenses });
      setInsights(result);
    } catch (error) {
      console.error("Error generating insights:", error);
      setInsights({ insights: "Sorry, I couldn't generate insights at this moment. Please try again later." });
    } finally {
      setIsLoadingInsights(false);
    }
  };
  
  const exportData = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fintrack-lite-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        onAddTransaction={() => setIsAddDialogOpen(true)}
        onGenerateInsights={handleGenerateInsights}
        onExportData={exportData}
      />
      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          <Overview transactions={transactions} />
          {transactions.length > 0 ? (
            <TransactionTable transactions={transactions} onDeleteTransaction={deleteTransaction} />
          ) : (
            <EmptyState onAddTransaction={() => setIsAddDialogOpen(true)} />
          )}
        </div>
      </main>
      <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddTransaction={addTransaction}
      />
      <AIInsightsDrawer
        open={isInsightsDrawerOpen}
        onOpenChange={setIsInsightsDrawerOpen}
        insights={insights}
        isLoading={isLoadingInsights}
        onRegenerate={handleGenerateInsights}
      />
    </div>
  );
}

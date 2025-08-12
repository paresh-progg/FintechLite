'use client';

import { useState, useEffect } from 'react';
import type { Transaction, Budget } from '@/lib/types';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import Overview from '@/components/dashboard/overview';
import TransactionTable from '@/components/dashboard/transaction-table';
import EmptyState from '@/components/dashboard/empty-state';
import { generateFinancialInsights } from '@/ai/flows/generate-financial-insights';
import type { GenerateFinancialInsightsOutput } from '@/ai/flows/generate-financial-insights';
import AddTransactionDialog from '@/components/dashboard/add-transaction-dialog';
import AIInsightsDrawer from '@/components/dashboard/ai-insights-drawer';
import BudgetDialog from '@/components/dashboard/budget-dialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);
  const [insights, setInsights] = useState<GenerateFinancialInsightsOutput | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isInsightsDrawerOpen, setIsInsightsDrawerOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleAddOrUpdateTransaction = (transaction: Omit<Transaction, 'id' | 'date'> & { date: string }, id?: string) => {
    const transactionWithDate = { ...transaction, date: new Date(transaction.date) };
    if (id) {
      // Update existing transaction
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...transactionWithDate } : t)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } else {
      // Add new transaction
      const newTransaction = { ...transactionWithDate, id: crypto.randomUUID() };
      setTransactions((prev) => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    setInsights(null); // Invalidate old insights
    setIsAddDialogOpen(false);
    setEditingTransaction(null);
  };

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsAddDialogOpen(true);
  };
  
  const openAddDialog = () => {
    setEditingTransaction(null);
    setIsAddDialogOpen(true);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setInsights(null); // Invalidate old insights
  };
  
  const handleSetBudgets = (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
    setIsBudgetDialogOpen(false);
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
    const dataStr = JSON.stringify({transactions, budgets}, null, 2);
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

  const distinctCategories = [...new Set(transactions.filter(t => t.type === 'expense').map(t => t.category))];


  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        onAddTransaction={openAddDialog}
        onGenerateInsights={handleGenerateInsights}
        onExportData={exportData}
        onSetBudget={() => setIsBudgetDialogOpen(true)}
      />
      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
        {!isClient ? (
          <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
              <Skeleton className="h-96" />
          </div>
        ) : (
          <div className="space-y-8">
            <Overview transactions={transactions} budgets={budgets} />
            {transactions.length > 0 ? (
              <TransactionTable transactions={transactions} onDeleteTransaction={deleteTransaction} onEditTransaction={openEditDialog} />
            ) : (
              <EmptyState onAddTransaction={openAddDialog} />
            )}
          </div>
        )}
      </main>
      <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={(isOpen) => {
          setIsAddDialogOpen(isOpen);
          if (!isOpen) setEditingTransaction(null);
        }}
        onAddTransaction={handleAddOrUpdateTransaction}
        transaction={editingTransaction}
      />
       <BudgetDialog
        open={isBudgetDialogOpen}
        onOpenChange={setIsBudgetDialogOpen}
        onSetBudgets={handleSetBudgets}
        categories={distinctCategories}
        currentBudgets={budgets}
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

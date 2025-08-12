
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import TransactionFilters from '@/components/dashboard/transaction-filters';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, getBudgets, setBudgets as setFirestoreBudgets } from '@/lib/firestore';
import { DateRange } from 'react-day-picker';

export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [insights, setInsights] = useState<GenerateFinancialInsightsOutput | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isInsightsDrawerOpen, setIsInsightsDrawerOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribeTransactions = getTransactions(user.uid, setTransactions);
      const unsubscribeBudgets = getBudgets(user.uid, setBudgets);

      return () => {
        unsubscribeTransactions();
        unsubscribeBudgets();
      };
    }
  }, [user]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const searchMatch = searchQuery ? 
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.notes?.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      
      const categoryMatch = selectedCategories.length > 0 ? selectedCategories.includes(t.category) : true;

      const dateMatch = dateRange?.from ? 
        new Date(t.date) >= dateRange.from && new Date(t.date) <= (dateRange.to || dateRange.from) : true;
        
      return searchMatch && categoryMatch && dateMatch;
    });
  }, [transactions, searchQuery, selectedCategories, dateRange]);
  
  const handleAddOrUpdateTransaction = async (transaction: Omit<Transaction, 'id' | 'date'> & { date: string }, id?: string) => {
    if (!user) return;
    
    const transactionWithDate = { ...transaction, date: new Date(transaction.date).toISOString() };
    
    if (id) {
      await updateTransaction(user.uid, id, transactionWithDate);
    } else {
      await addTransaction(user.uid, transactionWithDate);
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

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    await deleteTransaction(user.uid, id);
    setInsights(null); // Invalidate old insights
  };
  
  const handleSetBudgets = async (newBudgets: Budget[]) => {
    if (!user) return;
    await setFirestoreBudgets(user.uid, newBudgets);
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

  const distinctCategories = [...new Set(transactions.map(t => t.category))];


  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        onGenerateInsights={handleGenerateInsights}
        onExportData={exportData}
        onSetBudget={() => setIsBudgetDialogOpen(true)}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
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
          <>
            <Overview transactions={transactions} budgets={budgets} />
            {transactions.length > 0 ? (
              <div className='space-y-4'>
                <TransactionFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  categories={distinctCategories}
                  onAddTransaction={openAddDialog}
                />
                <TransactionTable transactions={filteredTransactions} onDeleteTransaction={handleDeleteTransaction} onEditTransaction={openEditDialog} />
              </div>
            ) : (
              <EmptyState onAddTransaction={openAddDialog} />
            )}
          </>
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
        categories={[...new Set(transactions.filter(t => t.type === 'expense').map(t => t.category))]}
        currentBudgets={budgets}
      />
      <AIInsightsDrawer
        open={isInsightsDrawerOpen}
        onOpenChange={setIsInsightsDrawerOpen}
        insights={insights}
        isLoading={isLoading}
        onRegenerate={handleGenerateInsights}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Budget } from '@/lib/types';
import { Trash2 } from 'lucide-react';

type BudgetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetBudgets: (budgets: Budget[]) => void;
  categories: string[];
  currentBudgets: Budget[];
};

export default function BudgetDialog({ open, onOpenChange, onSetBudgets, categories, currentBudgets }: BudgetDialogProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  useEffect(() => {
    if (open) {
      // Initialize budgets for all available expense categories
      const initialBudgets = categories.map(category => {
        const existingBudget = currentBudgets.find(b => b.category === category);
        return { category, amount: existingBudget?.amount || 0 };
      });
      setBudgets(initialBudgets);
    }
  }, [open, categories, currentBudgets]);

  const handleBudgetChange = (category: string, amount: string) => {
    const newAmount = parseFloat(amount) || 0;
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, amount: newAmount } : b));
  };

  const handleSave = () => {
    // Filter out budgets with 0 amount
    onSetBudgets(budgets.filter(b => b.amount > 0));
  };
  
  const handleRemoveBudget = (category: string) => {
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, amount: 0 } : b));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Monthly Budgets</DialogTitle>
          <DialogDescription>
            Define budgets for your expense categories. Any category with a budget of $0 will not be tracked.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 pr-6">
          <div className="space-y-4 py-4">
            {budgets.length > 0 ? (
                budgets.map(budget => (
                <div key={budget.category} className="flex items-center gap-4">
                    <Label htmlFor={`budget-${budget.category}`} className="flex-1 text-right">
                    {budget.category}
                    </Label>
                    <div className="flex items-center gap-2 flex-2">
                        <Input
                            id={`budget-${budget.category}`}
                            type="number"
                            value={budget.amount || ''}
                            onChange={(e) => handleBudgetChange(budget.category, e.target.value)}
                            placeholder="0.00"
                            className="w-32"
                            step="1"
                            min="0"
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveBudget(budget.category)} className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
                ))
            ) : (
                <p className="text-center text-muted-foreground">
                    Add some expense transactions to start setting budgets.
                </p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSave}>Save Budgets</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

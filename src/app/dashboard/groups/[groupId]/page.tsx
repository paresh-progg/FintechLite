'use client';

import { useState, useMemo, useEffect } from 'react';
import { type Group, type GroupExpense, type Settlement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, HandCoins, ArrowLeft, ArrowRight, Users } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import AddExpenseDialog from '@/components/dashboard/groups/add-expense-dialog';
import AddSettlementDialog from '@/components/dashboard/groups/add-settlement-dialog';
import { useAuth } from '@/hooks/use-auth';
import { getGroup, getGroupExpenses, addGroupExpense, getSettlements, addSettlement } from '@/lib/firestore';

export default function GroupDetailPage({ params }: { params: { groupId: string } }) {
  const { groupId } = params;
  const { user } = useAuth();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isSettlementDialogOpen, setIsSettlementDialogOpen] = useState(false);

  useEffect(() => {
    if (user && groupId) {
        const unsubscribeGroup = getGroup(user.uid, groupId, (groupData) => {
            setGroup(groupData);
            setLoading(!groupData);
        });
        const unsubscribeExpenses = getGroupExpenses(user.uid, groupId, setExpenses);
        const unsubscribeSettlements = getSettlements(user.uid, groupId, setSettlements);

        return () => {
            unsubscribeGroup();
            unsubscribeExpenses();
            unsubscribeSettlements();
        }
    } else if (!user) {
        setLoading(false);
    }
  }, [user, groupId]);
  
  const balances = useMemo(() => {
    if (!group) return {};
    const memberBalances: { [key: string]: number } = {};
    group.members.forEach(m => memberBalances[m.id] = 0);

    // Calculate from expenses
    expenses.forEach(expense => {
      if (memberBalances[expense.paidById] !== undefined) {
        memberBalances[expense.paidById] += expense.amount;
      }
      expense.split.forEach(s => {
        if (memberBalances[s.memberId] !== undefined) {
          memberBalances[s.memberId] -= s.amount;
        }
      });
    });

    // Calculate from settlements
    settlements.forEach(settlement => {
        if (memberBalances[settlement.fromId] !== undefined) {
          memberBalances[settlement.fromId] -= settlement.amount;
        }
        if (memberBalances[settlement.toId] !== undefined) {
          memberBalances[settlement.toId] += settlement.amount;
        }
    });

    return memberBalances;

  }, [group, expenses, settlements]);

  const debts = useMemo(() => {
    const debtors: { [key: string]: number } = {};
    const creditors: { [key: string]: number } = {};
  
    Object.entries(balances).forEach(([memberId, balance]) => {
      if (balance > 0) {
        creditors[memberId] = balance;
      } else if (balance < 0) {
        debtors[memberId] = -balance;
      }
    });

    const settledDebts: { from: string, to: string, amount: number }[] = [];
  
    let tempCreditors = { ...creditors };

    Object.entries(debtors).forEach(([debtorId, debtorAmount]) => {
      let amountToSettle = debtorAmount;
      Object.entries(tempCreditors).forEach(([creditorId, creditorAmount]) => {
        if (amountToSettle <= 0.001 || creditorAmount <= 0.001) return;
        
        const amount = Math.min(amountToSettle, creditorAmount);
        
        if (amount > 0) {
          settledDebts.push({ from: debtorId, to: creditorId, amount });
          amountToSettle -= amount;
          tempCreditors[creditorId] -= amount;
        }
      });
    });
  
    return settledDebts;
  }, [balances]);

  const handleAddExpense = async (expense: Omit<GroupExpense, 'id'>) => {
    if (!user) return;
    await addGroupExpense(user.uid, { ...expense, id: crypto.randomUUID() });
    setIsExpenseDialogOpen(false);
  }

  const handleAddSettlement = async (settlement: Omit<Settlement, 'id'>) => {
    if (!user) return;
    await addSettlement(user.uid, { ...settlement, id: crypto.randomUUID() });
    setIsSettlementDialogOpen(false);
  }
  
  if (loading) {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Skeleton className="h-8 w-36 mb-6" />
            <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-36" />
                </div>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1 space-y-6">
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-56 w-full" />
                </div>
                <div className="md:col-span-2">
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Group not found</h1>
        <p>The group you are looking for does not exist or you do not have permission to view it.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/groups">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go back to groups
          </Link>
        </Button>
      </div>
    );
  }

  const getMemberName = (id: string) => group.members.find(m => m.id === id)?.name || 'Unknown';

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
       <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/dashboard/groups">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Groups
          </Link>
        </Button>
      <div className="flex items-start justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Users className="h-5 w-5" /> <span>{group.members.length} members</span>
            </div>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => setIsSettlementDialogOpen(true)}>
                <HandCoins className="mr-2 h-4 w-4" /> Settle Up
            </Button>
            <Button onClick={() => setIsExpenseDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
            </Button>
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        {/* Balances Card */}
        <div className="md:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Balances</CardTitle>
                    <CardDescription>Overall balances for each member.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {Object.entries(balances).map(([memberId, balance]) => (
                            <li key={memberId} className="flex justify-between items-center text-sm">
                                <span>{getMemberName(memberId)}</span>
                                <span className={balance >= 0 ? 'text-primary' : 'text-destructive'}>
                                    {formatCurrency(balance)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

             {/* Who Owes Who Card */}
             <Card>
                <CardHeader>
                    <CardTitle>Who Owes Who</CardTitle>
                    <CardDescription>A simplified breakdown of debts.</CardDescription>
                </CardHeader>
                <CardContent>
                    {debts.length > 0 ? (
                        <ul className="space-y-3">
                            {debts.map((debt, index) => (
                                <li key={index} className="flex items-center text-sm">
                                    <span className="font-medium w-1/3 truncate text-right">{getMemberName(debt.from)}</span>
                                    <div className="flex-shrink-0 px-2 flex flex-col items-center justify-center w-auto">
                                        <span className="text-xs text-muted-foreground">owes</span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <span className="font-medium w-1/3 truncate">{getMemberName(debt.to)}</span>
                                    <span className="ml-auto font-semibold text-right">{formatCurrency(debt.amount)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground">All settled up!</p>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Expenses Card */}
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Group Expenses</CardTitle>
                    <CardDescription>All expenses recorded for this group.</CardDescription>
                </CardHeader>
                <CardContent>
                    {expenses.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Paid by</TableHead>
                                <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => (
                                <TableRow key={expense.id}>
                                    <TableCell className="font-medium">{expense.description}</TableCell>
                                    <TableCell>{formatCurrency(expense.amount)}</TableCell>
                                    <TableCell>{getMemberName(expense.paidById)}</TableCell>
                                    <TableCell>{format(new Date(expense.date), 'dd MMM, yyyy')}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No expenses added yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      <AddExpenseDialog 
        open={isExpenseDialogOpen} 
        onOpenChange={setIsExpenseDialogOpen} 
        onAddExpense={handleAddExpense}
        group={group}
      />
      <AddSettlementDialog 
        open={isSettlementDialogOpen} 
        onOpenChange={setIsSettlementDialogOpen} 
        onAddSettlement={handleAddSettlement}
        group={group}
      />
    </div>
  );
}

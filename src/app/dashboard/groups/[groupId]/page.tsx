
'use client';

import { useState, useMemo, useEffect } from 'react';
import { type Group, type GroupExpense, type Settlement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, HandCoins, ArrowLeft, ArrowRight, Users, History } from 'lucide-react';
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
import { useParams } from 'next/navigation';

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string;
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
        });
        const unsubscribeExpenses = getGroupExpenses(user.uid, groupId, setExpenses);
        const unsubscribeSettlements = getSettlements(user.uid, groupId, setSettlements);
        
        Promise.all([
          new Promise(res => getGroup(user.uid, groupId, res)),
        ]).then(() => setLoading(false));

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
          // Person who paid is settling a debt, their balance increases towards 0
          memberBalances[settlement.fromId] += settlement.amount;
        }
        if (memberBalances[settlement.toId] !== undefined) {
          // Person who received payment is owed less, their balance decreases towards 0
          memberBalances[settlement.toId] -= settlement.amount;
        }
    });

    return memberBalances;

  }, [group, expenses, settlements]);

  const debts = useMemo(() => {
    const debtors: { id: string, amount: number }[] = [];
    const creditors: { id: string, amount: number }[] = [];

    Object.entries(balances).forEach(([memberId, balance]) => {
      if (balance > 0.01) {
        creditors.push({ id: memberId, amount: balance });
      } else if (balance < -0.01) {
        debtors.push({ id: memberId, amount: -balance });
      }
    });
    
    creditors.sort((a,b) => a.amount - b.amount);
    debtors.sort((a,b) => a.amount - b.amount);

    const settledDebts: { from: string, to: string, amount: number }[] = [];
  
    while(debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];
      const amount = Math.min(debtor.amount, creditor.amount);

      settledDebts.push({ from: debtor.id, to: creditor.id, amount: amount });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount < 0.01) {
        debtors.shift();
      }
      if (creditor.amount < 0.01) {
        creditors.shift();
      }
    }
  
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
        <div className="p-4 sm:p-6 lg:p-8">
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
      <div className="p-8 text-center">
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
  
  const allTransactions = [
    ...expenses.map(e => ({ ...e, type: 'expense' })),
    ...settlements.map(s => ({...s, type: 'settlement'}))
  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-4 sm:p-6 lg:p-8">
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
        {/* Left Column */}
        <div className="md:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Balances</CardTitle>
                    <CardDescription>Final balance for each member.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {group.members.map(member => (
                            <li key={member.id} className="flex justify-between items-center text-sm">
                                <span>{member.name}</span>
                                <span className={(balances[member.id] || 0) >= 0 ? 'text-primary' : 'text-destructive'}>
                                    {formatCurrency(balances[member.id] || 0)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

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

        {/* Right Column */}
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>All expenses and settlements for this group.</CardDescription>
                </CardHeader>
                <CardContent>
                    {allTransactions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Transaction</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allTransactions.map(item => (
                                <TableRow key={`${item.type}-${item.id}`}>
                                    <TableCell className="font-medium">
                                        {item.type === 'expense' ? (
                                            <>
                                                <div>{item.description}</div>
                                                <div className="text-xs text-muted-foreground">Paid by {getMemberName(item.paidById)}</div>
                                            </>
                                        ) : (
                                            <div className="flex items-center">
                                                <HandCoins className="h-4 w-4 mr-2 text-primary" />
                                                <div>
                                                    <div>Settlement</div>
                                                    <div className="text-xs text-muted-foreground">{getMemberName(item.fromId)} paid {getMemberName(item.toId)}</div>
                                                </div>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{format(new Date(item.date), 'dd MMM, yyyy')}</TableCell>
                                    <TableCell className="text-right font-semibold">{formatCurrency(item.amount)}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
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

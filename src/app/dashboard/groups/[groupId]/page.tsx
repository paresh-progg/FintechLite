'use client';

import { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type Group, type GroupExpense, type Settlement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, HandCoins, ArrowLeft, ArrowRight, Trash2, Users } from 'lucide-react';
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

// This is a placeholder for a more complex component we'll build later
const AddExpenseDialog = ({ open, onOpenChange, onAddExpense }: any) => null;
const AddSettlementDialog = ({ open, onOpenChange, onAddSettlement }: any) => null;

export default function GroupDetailPage({ params }: { params: { groupId: string } }) {
  const { groupId } = params;
  const [groups, setGroups] = useLocalStorage<Group[]>('groups', []);
  const [expenses, setExpenses] = useLocalStorage<GroupExpense[]>('group_expenses', []);
  const [settlements, setSettlements] = useLocalStorage<Settlement[]>('group_settlements', []);

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isSettlementDialogOpen, setIsSettlementDialogOpen] = useState(false);

  const group = useMemo(() => groups.find((g) => g.id === groupId), [groups, groupId]);
  const groupExpenses = useMemo(() => expenses.filter(e => e.groupId === groupId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [expenses, groupId]);
  
  const balances = useMemo(() => {
    if (!group) return {};
    const memberBalances: { [key: string]: number } = {};
    group.members.forEach(m => memberBalances[m.id] = 0);

    // Calculate from expenses
    groupExpenses.forEach(expense => {
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
    settlements.filter(s => s.groupId === groupId).forEach(settlement => {
        if (memberBalances[settlement.fromId] !== undefined) {
          memberBalances[settlement.fromId] -= settlement.amount;
        }
        if (memberBalances[settlement.toId] !== undefined) {
          memberBalances[settlement.toId] += settlement.amount;
        }
    });

    return memberBalances;

  }, [group, groupExpenses, settlements, groupId]);

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
        if (amountToSettle === 0 || creditorAmount === 0) return;
        
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


  if (!group) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Group not found</h1>
        <p>The group you are looking for does not exist.</p>
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
                                <li key={index} className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{getMemberName(debt.from)}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
                                    <span className="font-medium">{getMemberName(debt.to)}</span>
                                    <span className="ml-auto font-semibold">{formatCurrency(debt.amount)}</span>
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
                    {groupExpenses.length > 0 ? (
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
                                {groupExpenses.map(expense => (
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
       {/* Placeholder Dialogs */}
      <AddExpenseDialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen} onAddExpense={() => {}} />
      <AddSettlementDialog open={isSettlementDialogOpen} onOpenChange={setIsSettlementDialogOpen} onAddSettlement={() => {}} />
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import type { Group, Settlement } from '@/lib/types';

const formSchema = z.object({
  fromId: z.string().min(1, "Please select who paid."),
  toId: z.string().min(1, "Please select who received."),
  amount: z.coerce.number().positive("Amount must be positive."),
}).refine(data => data.fromId !== data.toId, {
    message: "Sender and receiver cannot be the same person.",
    path: ['toId'],
});

type AddSettlementDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSettlement: (settlement: Omit<Settlement, 'id'>) => void;
  group: Group;
};

export default function AddSettlementDialog({ open, onOpenChange, onAddSettlement, group }: AddSettlementDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromId: '',
      toId: '',
      amount: '' as any,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        fromId: '',
        toId: '',
        amount: '' as any,
      });
    }
  }, [open, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddSettlement({
      ...values,
      groupId: group.id,
      date: new Date().toISOString(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settle Up</DialogTitle>
          <DialogDescription>
            Record a payment between two members to settle a debt.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="flex items-center gap-2">
                <FormField
                    control={form.control}
                    name="fromId"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                        <FormLabel>From</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Sender" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {group.members.map(member => (
                                <SelectItem key={member.id} value={member.id}>
                                    {member.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <ArrowRight className="h-5 w-5 mt-8 text-muted-foreground" />
                 <FormField
                    control={form.control}
                    name="toId"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                        <FormLabel>To</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Receiver" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {group.members.map(member => (
                                <SelectItem key={member.id} value={member.id}>
                                    {member.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="0.00" {...field} step="0.01" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Record Payment</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, formatCurrency } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { Group, GroupExpense } from '@/lib/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().positive('Amount must be positive.'),
  paidById: z.string().min(1, 'Please select who paid.'),
  date: z.date(),
  splitType: z.enum(['equally', 'unequally']),
  split: z.array(z.object({
    memberId: z.string(),
    amount: z.coerce.number().min(0, "Amount can't be negative.")
  })),
}).refine(data => {
    if (data.splitType === 'unequally') {
        const totalSplit = data.split.reduce((sum, s) => sum + s.amount, 0);
        return Math.abs(totalSplit - data.amount) < 0.01; // Allow for floating point inaccuracies
    }
    return true;
}, {
    message: "The split amounts must add up to the total expense amount.",
    path: ['split'],
});

type AddExpenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (expense: Omit<GroupExpense, 'id'>) => void;
  group: Group;
};

export default function AddExpenseDialog({ open, onOpenChange, onAddExpense, group }: AddExpenseDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: '' as any,
      paidById: '',
      date: new Date(),
      splitType: 'equally',
      split: group.members.map(m => ({ memberId: m.id, amount: 0 })),
    },
  });
  
  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'split',
  });

  const amount = form.watch('amount');
  const splitType = form.watch('splitType');
  const splitAmounts = form.watch('split');

  const totalSplit = useMemo(() => splitAmounts.reduce((sum, s) => sum + Number(s.amount || 0), 0), [splitAmounts]);
  const remainingAmount = useMemo(() => amount - totalSplit, [amount, totalSplit]);

  useEffect(() => {
    if(open) {
        form.reset({
            description: '',
            amount: '' as any,
            paidById: '',
            date: new Date(),
            splitType: 'equally',
            split: group.members.map(m => ({ memberId: m.id, amount: 0 })),
        });
    }
  }, [open, group, form]);


  useEffect(() => {
    const newSplits = group.members.map(m => ({ memberId: m.id, amount: 0 }));
    if (splitType === 'equally' && amount > 0) {
      const equalAmount = parseFloat((amount / group.members.length).toFixed(2));
      const newEqualSplits = group.members.map((m, index) => ({
          memberId: m.id,
          amount: index === 0 ? amount - (equalAmount * (group.members.length - 1)) : equalAmount
      }));
      replace(newEqualSplits);
    } else {
        replace(newSplits);
    }
  }, [amount, splitType, group.members, replace]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddExpense({
        ...values,
        groupId: group.id,
        date: values.date.toISOString(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add an Expense</DialogTitle>
          <DialogDescription>
            Record a new shared expense for the group.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Dinner" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
                <FormField
                control={form.control}
                name="paidById"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Paid by</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a member" />
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
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="splitType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Split</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="equally" />
                        </FormControl>
                        <FormLabel className="font-normal">Equally</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="unequally" />
                        </FormControl>
                        <FormLabel className="font-normal">Unequally</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            {splitType === 'unequally' && (
                <div>
                    <ScrollArea className="h-36 pr-4">
                    <div className="space-y-2">
                        {fields.map((field, index) => (
                        <FormField
                            key={field.id}
                            control={form.control}
                            name={`split.${index}.amount`}
                            render={({ field: itemField }) => (
                            <FormItem>
                                <div className="flex items-center gap-4">
                                <FormLabel className="w-24 text-right">
                                    {group.members.find(m => m.id === field.memberId)?.name}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        {...itemField}
                                        step="0.01"
                                    />
                                </FormControl>
                                </div>
                            </FormItem>
                            )}
                        />
                        ))}
                    </div>
                    </ScrollArea>
                    <div className="text-right mt-2 text-sm font-medium">
                        Remaining: <span className={cn(remainingAmount !== 0 ? 'text-destructive' : 'text-primary' )}>{formatCurrency(remainingAmount)}</span>
                    </div>
                </div>
            )}
             {form.formState.errors.split && (
                <Alert variant="destructive">
                    <AlertDescription>{form.formState.errors.split.message}</AlertDescription>
                </Alert>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Add Expense</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

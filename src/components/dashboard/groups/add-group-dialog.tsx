'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { Group } from '@/lib/types';

const memberSchema = z.object({
  name: z.string().min(1, 'Member name is required.'),
});

const formSchema = z.object({
  name: z.string().min(1, 'Group name is required.').max(50, 'Group name is too long.'),
  members: z.array(memberSchema).min(1, 'Please add at least one member.'),
});

type AddGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGroup: (group: Omit<Group, 'id'>) => void;
};

export default function AddGroupDialog({ open, onOpenChange, onAddGroup }: AddGroupDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      members: [{ name: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'members',
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const membersWithIds = values.members.map(member => ({...member, id: crypto.randomUUID()}))
    onAddGroup({ ...values, members: membersWithIds });
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a New Group</DialogTitle>
          <DialogDescription>
            Name your group and add the members you want to share expenses with.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Apartment roommates" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
                <FormLabel>Members</FormLabel>
                <ScrollArea className="h-48 mt-2 pr-4">
                <div className="space-y-2">
                    {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <FormField
                        control={form.control}
                        name={`members.${index}.name`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Input placeholder={`Member ${index + 1} name`} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={fields.length <= 1}
                            className="h-9 w-9"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    ))}
                </div>
                </ScrollArea>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ name: '' })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Member
                </Button>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Create Group</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

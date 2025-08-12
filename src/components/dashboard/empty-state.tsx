'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

type EmptyStateProps = {
    onAddTransaction: () => void;
};

export default function EmptyState({ onAddTransaction }: EmptyStateProps) {
  return (
    <div className="text-center p-8 border-2 border-dashed rounded-lg mt-8">
        <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
        >
            <path
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-foreground">No transactions yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new transaction.</p>
        <div className="mt-6">
            <Button onClick={onAddTransaction}>
                <PlusCircle className="-ml-0.5 mr-1.5 h-5 w-5" />
                New Transaction
            </Button>
        </div>
    </div>
  );
}

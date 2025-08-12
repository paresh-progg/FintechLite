'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Lightbulb, RefreshCw } from 'lucide-react';
import type { GenerateFinancialInsightsOutput } from '@/ai/flows/generate-financial-insights';

type AIInsightsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insights: GenerateFinancialInsightsOutput | null;
  isLoading: boolean;
  onRegenerate: () => Promise<void>;
};

export default function AIInsightsDrawer({
  open,
  onOpenChange,
  insights,
  isLoading,
  onRegenerate,
}: AIInsightsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-highlight" />
            AI Financial Insights
          </SheetTitle>
          <SheetDescription>
            Your personal AI advisor analyzing your spending patterns to provide actionable advice.
          </SheetDescription>
        </SheetHeader>
        <div className="py-8">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[75%]" />
              <Skeleton className="h-4 w-[85%]" />
            </div>
          )}
          {insights && !isLoading && (
            <p className="leading-relaxed text-sm whitespace-pre-wrap">{insights.insights}</p>
          )}
        </div>
        <SheetFooter>
            <Button onClick={onRegenerate} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Regenerate
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

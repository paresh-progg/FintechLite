'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, Lightbulb, PlusCircle, Target } from 'lucide-react';

type DashboardHeaderProps = {
  onAddTransaction: () => void;
  onGenerateInsights: () => void;
  onExportData: () => void;
  onSetBudget: () => void;
};

export default function DashboardHeader({
  onAddTransaction,
  onGenerateInsights,
  onExportData,
  onSetBudget,
}: DashboardHeaderProps) {

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="hsl(var(--primary))"/>
              <path d="M10 12H22" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 16H22" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 20H16" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h1 className="text-xl font-bold text-foreground hidden md:block">FinTrack Lite</h1>
          </Link>
      </div>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial" />
        <Button variant="outline" size="sm" onClick={onExportData}>
          <Download className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Export</span>
        </Button>
        <Button variant="outline" size="sm" onClick={onSetBudget}>
          <Target className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Set Budget</span>
        </Button>
        <Button variant="outline" size="sm" onClick={onGenerateInsights}>
          <Lightbulb className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">AI Insights</span>
        </Button>
        <Button size="sm" onClick={onAddTransaction}>
          <PlusCircle className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Add Transaction</span>
        </Button>
      </div>
    </header>
  );
}

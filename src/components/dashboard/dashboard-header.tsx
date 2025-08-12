
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, Lightbulb, PlusCircle, Target, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

type DashboardHeaderProps = {
  onGenerateInsights: () => void;
  onExportData: () => void;
  onSetBudget: () => void;
};

export default function DashboardHeader({
  onGenerateInsights,
  onExportData,
  onSetBudget,
}: DashboardHeaderProps) {

  return (
    <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b bg-muted/40">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
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
        </div>
    </div>
  );
}

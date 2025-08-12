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
  const { logOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logOut();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="hsl(var(--primary))"/>
              <path d="M18.5 10H13.5C11.567 10 10 11.567 10 13.5V18.5C10 20.433 11.567 22 13.5 22H18.5C20.433 22 22 20.433 22 18.5V13.5C22 11.567 20.433 10 18.5 10Z" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 16.5C16.8284 16.5 17.5 15.8284 17.5 15C17.5 14.1716 16.8284 13.5 16 13.5C15.1716 13.5 14.5 14.1716 14.5 15C14.5 15.8284 15.1716 16.5 16 16.5Z" fill="hsl(var(--primary-foreground))"/>
          </svg>
          <h1 className="text-xl font-bold text-foreground hidden md:block">Gudget</h1>
          </Link>
      </div>
      <nav className="hidden w-full items-center gap-4 md:ml-auto md:flex md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial" />
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/groups">
            <Users className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Groups</span>
          </Link>
        </Button>
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
         <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </nav>
      {/* Mobile Menu could be a separate component with a dropdown */}
      <div className="md:hidden ml-auto">
          <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
          </Button>
      </div>
    </header>
  );
}

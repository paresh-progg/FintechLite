
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, LogOut, PanelLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { logOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logOut();
    router.push('/login');
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/groups', label: 'Groups', icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
        return pathname === href;
    }
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <>
        <div className="flex-1">
            <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map(item => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive(item.href) ? 'bg-muted text-primary' : 'text-muted-foreground hover:text-primary'}`}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </Link>
            ))}
            </nav>
        </div>
        <div className="mt-auto p-4">
            <Button size="sm" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4"/>
                Sign Out
            </Button>
        </div>
    </>
  );

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 lg:flex lg:flex-col">
        <div className="px-4 py-6">
            <Link href="/" className="flex items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="8" fill="hsl(var(--primary))"/>
                    <path d="M10 13L16 19L22 13" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 19L16 25L22 19" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5"/>
                </svg>
                <h1 className="text-xl font-bold text-foreground">FinTrack Lite</h1>
            </Link>
        </div>
        {sidebarContent}
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6 lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                >
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0">
                    <SheetHeader className='p-4 border-b'>
                        <SheetTitle>
                            <Link href="/" className="flex items-center gap-2">
                                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="32" height="32" rx="8" fill="hsl(var(--primary))"/>
                                    <path d="M10 13L16 19L22 13" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M10 19L16 25L22 19" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5"/>
                                </svg>
                                <span className="text-lg font-bold text-foreground">FinTrack Lite</span>
                            </Link>
                        </SheetTitle>
                    </SheetHeader>
                    {sidebarContent}
                </SheetContent>
            </Sheet>
            <div className='flex-1 text-center'>
                <h1 className="text-lg font-semibold">
                    {navItems.find(item => isActive(item.href))?.label}
                </h1>
            </div>
        </header>
        <div className="flex-1 bg-background overflow-auto">
            {children}
        </div>
      </div>
    </div>
  )
}

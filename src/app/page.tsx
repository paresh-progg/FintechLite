'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart2, Lightbulb, ListPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user, loading } = useAuth();
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="hsl(var(--primary))"/>
            <path d="M10 12H22" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 16H22" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 20H16" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h1 className="text-xl font-bold text-foreground">FinTrack Lite</h1>
        </Link>
        <Button asChild>
          <Link href={user ? "/dashboard" : "/login"}>
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter font-headline">
                Simple, Smart Financial Tracking
              </h2>
              <p className="text-lg text-muted-foreground max-w-lg">
                Take control of your finances without the complexity. FinTrack Lite
                helps you manage income and expenses, visualize your spending, and
                gain AI-powered insights. All without needing an account.
              </p>
              <Button size="lg" asChild>
                <Link href={user ? "/dashboard" : "/login"}>
                  Start Tracking for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="rounded-xl shadow-2xl overflow-hidden border-4 border-card">
              <Image
                src="https://placehold.co/600x400.png"
                alt="FinTrack Lite Dashboard Preview"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                data-ai-hint="finance dashboard"
              />
            </div>
          </div>
        </section>

        <section className="bg-card py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <h3 className="text-3xl font-bold font-headline">Features at a Glance</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need for basic financial tracking, powered by smart technology.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-background/50">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <ListPlus className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Easy Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Quickly add income and expense entries with categories, dates, and notes.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-background/50">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-accent/10 p-3 rounded-full">
                    <BarChart2 className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>Data Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    See where your money goes with interactive charts showing income vs. expenses.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-background/50">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-purple-500/10 p-3 rounded-full">
                    <Lightbulb className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle>AI Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get personalized spending advice from your AI financial advisor to save more.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FinTrack Lite. Your data is stored locally in your browser.</p>
      </footer>
    </div>
  );
}

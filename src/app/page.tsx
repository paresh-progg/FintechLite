
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart2, Lightbulb, ListPlus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user, loading } = useAuth();
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="hsl(var(--primary))"></rect>
            <path d="M10 10L16 16L22 10" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M10 16L16 22L22 16" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <h1 className="text-xl font-bold text-foreground">FinTrack Lite</h1>
        </Link>
        <Button asChild variant="gradient">
          <Link href={user ? "/dashboard" : "/login"}>
            {user ? 'Go to Dashboard' : 'Get Started'} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Simple, Smart Financial Tracking
              </h2>
              <p className="text-lg text-muted-foreground max-w-lg">
                Take control of your finances with an easy-to-use tracker. Manage income, expenses, and group tabs with AI-powered insights to guide you.
              </p>
              <Button size="lg" asChild variant="gradient">
                <Link href={user ? "/dashboard" : "/login"}>
                  Start Tracking for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="rounded-xl shadow-2xl overflow-hidden border-4 border-card transform hover:scale-105 transition-transform duration-300">
              <Image
                src="https://placehold.co/1200x800.png"
                alt="FinTrack Lite Dashboard Preview"
                width={1200}
                height={800}
                className="w-full h-auto object-cover"
                data-ai-hint="finance app dashboard"
              />
            </div>
          </div>
        </section>

        <section className="bg-card/50 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <h3 className="text-3xl font-bold font-headline">Features at a Glance</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need for personal and group financial clarity, powered by smart technology.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-background/70 text-center border-0 shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <CardHeader className="items-center">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <ListPlus className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Easy Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Quickly add income and expense entries with just a few clicks.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-background/70 text-center border-0 shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <CardHeader className="items-center">
                  <div className="bg-accent/10 p-3 rounded-full">
                    <Users className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle>Group Splitting</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Create groups and split bills equally or customize it as you need.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-background/70 text-center border-0 shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <CardHeader className="items-center">
                  <div className="bg-green-500/10 p-3 rounded-full">
                    <BarChart2 className="h-8 w-8 text-green-500" />
                  </div>
                  <CardTitle>Data Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    See where your money goes with interactive charts and budget tracking.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-background/70 text-center border-0 shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <CardHeader className="items-center">
                  <div className="bg-purple-500/10 p-3 rounded-full">
                    <Lightbulb className="h-8 w-8 text-purple-500" />
                  </div>
                  <CardTitle>AI Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get personalized spending advice from your AI financial advisor.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FinTrack Lite. Your financial journey, simplified.</p>
      </footer>
    </div>
  );
}

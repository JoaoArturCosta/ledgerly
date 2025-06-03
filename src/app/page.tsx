import Link from "next/link";
import { getServerAuthSession } from "@/server/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  DollarSign,
  Shield,
  TrendingUp,
  Wallet,
  Target,
  Brain,
  CheckCircle,
} from "lucide-react";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              Kleero
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Welcome back, {session.user.name}!
                </span>
                <Button asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <Button asChild>
                <Link href="/api/auth/signin">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-5xl font-bold text-slate-900 dark:text-white md:text-7xl">
            Revolutionizing
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Financial{" "}
            </span>
            Management
          </h1>
          <p className="mb-8 text-xl leading-relaxed text-slate-600 dark:text-slate-300 md:text-2xl">
            Empower your financial journey with AI-driven insights,
            comprehensive tracking, and intelligent budgeting. Take control of
            your finances like never before.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {!session ? (
              <Button size="lg" asChild className="px-8 py-6 text-lg">
                <Link href="/api/auth/signin">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild className="px-8 py-6 text-lg">
                <Link href="/dashboard">
                  Open Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
            Everything You Need for Financial Success
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-slate-600 dark:text-slate-300">
            Comprehensive tools designed to give you complete visibility and
            control over your financial life.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 transition-transform group-hover:scale-110 dark:bg-blue-900">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Get deep insights into your spending patterns with interactive
                charts and AI-powered analysis.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 transition-transform group-hover:scale-110 dark:bg-green-900">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Expense Tracking</CardTitle>
              <CardDescription>
                Categorize and track every expense with smart categorization and
                recurring transaction detection.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 transition-transform group-hover:scale-110 dark:bg-purple-900">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Income Management</CardTitle>
              <CardDescription>
                Track multiple income sources, recurring payments, and monitor
                your earning trends over time.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 transition-transform group-hover:scale-110 dark:bg-orange-900">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Savings Goals</CardTitle>
              <CardDescription>
                Set and track savings goals with progress monitoring and smart
                allocation recommendations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 transition-transform group-hover:scale-110 dark:bg-cyan-900">
                <CreditCard className="h-6 w-6 text-cyan-600" />
              </div>
              <CardTitle>Banking Integration</CardTitle>
              <CardDescription>
                Connect your bank accounts for automatic transaction syncing and
                real-time balance updates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 transition-transform group-hover:scale-110 dark:bg-red-900">
                <Brain className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>
                Receive personalized financial advice and spending optimization
                suggestions powered by AI.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div>
              <div className="mb-2 text-4xl font-bold text-slate-900 dark:text-white">
                10K+
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Happy Users
              </div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-slate-900 dark:text-white">
                $2M+
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Money Managed
              </div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-slate-900 dark:text-white">
                95%
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Satisfaction Rate
              </div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-slate-900 dark:text-white">
                24/7
              </div>
              <div className="text-slate-600 dark:text-slate-300">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Shield className="mx-auto mb-6 h-16 w-16 text-blue-600" />
          <h2 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white">
            Bank-Level Security
          </h2>
          <p className="mb-8 text-xl text-slate-600 dark:text-slate-300">
            Your financial data is protected with enterprise-grade security,
            OAuth authentication, and encrypted data transmission. We never
            store your banking credentials.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-slate-700 dark:text-slate-300">
                256-bit SSL Encryption
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-slate-700 dark:text-slate-300">
                OAuth 2.0 Authentication
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-slate-700 dark:text-slate-300">
                GDPR Compliant
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Ready to Transform Your Financial Life?
          </h2>
          <p className="mb-8 text-xl opacity-90">
            Join thousands of users who have taken control of their finances
            with Kleero.
          </p>
          {!session ? (
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="px-8 py-6 text-lg"
            >
              <Link href="/api/auth/signin">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="px-8 py-6 text-lg"
            >
              <Link href="/dashboard">
                Continue to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">Kleero</span>
              </div>
              <p className="text-slate-400">
                Revolutionizing financial management with AI-driven insights and
                comprehensive tracking.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Features</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Expense Tracking</li>
                <li>Income Management</li>
                <li>Savings Goals</li>
                <li>Banking Integration</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Connect</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Contact</li>
                <li>Blog</li>
                <li>Community</li>
                <li>Newsletter</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Kleero. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

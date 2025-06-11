import Link from "next/link";
import { getServerAuthSession } from "@/server/auth";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
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
  Shield,
  TrendingUp,
  Wallet,
  Target,
  Brain,
  CheckCircle,
} from "lucide-react";
import { StatusOverlay } from "@/components/ui/status-overlay";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Logo variant="header" />
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
            Take Control of Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Financial{" "}
            </span>
            Future
          </h1>
          <p className="mb-8 text-xl leading-relaxed text-slate-600 dark:text-slate-300 md:text-2xl">
            Kleero unifies all your accounts, tracks your expenses, and uses AI
            to optimize your wealth — in real-time. <br />
            <b>Smarter insights. Better decisions. More peace of mind.</b>
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
            <Button
              size="lg"
              variant="outline"
              asChild
              className="px-8 py-6 text-lg"
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
            Everything You Need to Master Your Money
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-slate-600 dark:text-slate-300">
            From budgeting and forecasting to personalized insights — Kleero
            gives you the tools to grow, protect, and manage your wealth.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 transition-transform group-hover:scale-110 dark:bg-blue-900">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>AI-Powered Analytics</CardTitle>
              <CardDescription>
                Visualize your financial trends and get predictive insights to
                make smarter decisions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 transition-transform group-hover:scale-110 dark:bg-green-900">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Intelligent Expense Tracking</CardTitle>
              <CardDescription>
                Automatically categorize transactions, spot patterns, and detect
                recurring payments effortlessly.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 transition-transform group-hover:scale-110 dark:bg-purple-900">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Income Stream Management</CardTitle>
              <CardDescription>
                Monitor salaries, side hustles, and passive income in one place
                — with support for recurring inflows.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 transition-transform group-hover:scale-110 dark:bg-orange-900">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Smart Savings Goals</CardTitle>
              <CardDescription>
                Set goals, track progress, and receive smart allocation
                suggestions to help you get there faster.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            <StatusOverlay status="coming-soon" />
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 transition-transform group-hover:scale-110 dark:bg-cyan-900">
                <CreditCard className="h-6 w-6 text-cyan-600" />
              </div>
              <CardTitle>Real-Time Banking Sync</CardTitle>
              <CardDescription>
                Connect multiple accounts and see a unified dashboard of your
                real-time balances and net worth.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            <StatusOverlay status="coming-soon" />
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 transition-transform group-hover:scale-110 dark:bg-red-900">
                <Brain className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Personalized AI Insights</CardTitle>
              <CardDescription>
                Get actionable recommendations to reduce waste, grow savings,
                and optimize spending — powered by machine learning.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Why Users Are Joining Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 to-blue-800 text-white">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl"></div>
        </div>

        <div className="container relative mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 text-lg font-medium text-blue-400">
              Global Scale
            </p>
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Why Users Are Joining Kleero
            </h2>
            <p className="mb-16 text-xl text-slate-300">
              We&apos;re just getting started — and building Kleero with a clear
              mission:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="group border-l-2 border-purple-400 pl-6">
              <div className="mb-4 text-3xl font-bold">💼</div>
              <h3 className="mb-3 text-xl font-bold">
                Designed for Modern Money Management
              </h3>
              <p className="text-sm text-slate-300">
                Built to simplify your financial life across multiple accounts,
                banks, and income sources.
              </p>
            </div>

            <div className="group border-l-2 border-purple-400 pl-6">
              <div className="mb-4 text-3xl font-bold">🤖</div>
              <h3 className="mb-3 text-xl font-bold">
                Powered by AI, Guided by You
              </h3>
              <p className="text-sm text-slate-300">
                Smart insights that adapt to your goals, spending, and lifestyle
                — not the other way around.
              </p>
            </div>

            <div className="group border-l-2 border-purple-400 pl-6">
              <div className="mb-4 text-3xl font-bold">🔒</div>
              <h3 className="mb-3 text-xl font-bold">Secure From Day One</h3>
              <p className="text-sm text-slate-300">
                Bank-level encryption, GDPR compliance, and OAuth integrations
                ensure your data is always safe.
              </p>
            </div>

            <div className="group border-l-2 border-purple-400 pl-6">
              <div className="mb-4 text-3xl font-bold">🌍</div>
              <h3 className="mb-3 text-xl font-bold">
                Community-Driven Vision
              </h3>
              <p className="text-sm text-slate-300">
                We&apos;re co-creating Kleero with real users — your feedback
                helps shape the future of personal finance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Shield className="mx-auto mb-6 h-16 w-16 text-blue-600" />
          <h2 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white">
            Built for Trust
          </h2>
          <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
            Security you can count on
          </h3>
          <p className="mb-8 text-xl text-slate-600 dark:text-slate-300">
            Your data is encrypted, your credentials are never stored, and your
            privacy is our priority.
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
                OAuth 2.0 Secure Bank Integration
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-slate-700 dark:text-slate-300">
                100% GDPR Compliant
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Your Financial Clarity Starts Now
          </h2>
          <p className="mb-8 text-xl opacity-90">
            Join thousands taking control of their finances with AI-powered
            clarity and confidence.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {!session ? (
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="px-8 py-6 text-lg"
              >
                <Link href="/api/auth/signin">
                  Start Your Free Journey
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
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="px-8 py-6 text-lg"
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4">
                <Logo variant="footer" />
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Heart } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { PLAN_CONFIG } from "@/lib/stripe-config";
import Layout from "@/components/Layout";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const createCheckoutSession =
    api.subscriptions.createCheckoutSession.useMutation({
      onSuccess: (data) => {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
      onSettled: () => {
        setLoadingPlan(null);
      },
    });

  const handleUpgrade = async (plan: "pro" | "premium") => {
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    setLoadingPlan(plan);
    createCheckoutSession.mutate({ plan });
  };

  const currentPlan = session?.user?.subscription?.plan ?? "free";

  const planIcons = {
    free: Heart,
    pro: Zap,
    premium: Crown,
  };

  return (
    <Layout title="Choose Your Plan" noDatePicker>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Choose the Perfect Plan for Your Financial Journey
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Start free and upgrade as you grow. All plans include our core
            expense tracking features.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          {Object.entries(PLAN_CONFIG).map(([planKey, plan]) => {
            const Icon = planIcons[planKey as keyof typeof planIcons];
            const isCurrentPlan = currentPlan === planKey;
            const isPopular = planKey === "pro";

            return (
              <Card
                key={planKey}
                className={`relative ${isPopular ? "scale-105 border-blue-500 shadow-lg" : ""} ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 transform bg-blue-500">
                    Most Popular
                  </Badge>
                )}

                {isCurrentPlan && (
                  <Badge className="absolute -top-3 right-4 bg-green-500">
                    Current Plan
                  </Badge>
                )}

                <CardHeader className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div
                      className={`rounded-full p-3 ${
                        planKey === "free"
                          ? "bg-gray-100 text-gray-600"
                          : planKey === "pro"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="mb-4 text-lg">
                    {plan.description}
                  </CardDescription>
                  <div className="text-4xl font-bold">
                    ${plan.price}
                    {plan.price > 0 && (
                      <span className="text-lg font-normal text-gray-500">
                        /month
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  {planKey === "free" ? (
                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? "secondary" : "outline"}
                      disabled={isCurrentPlan}
                      onClick={() =>
                        !session && router.push("/api/auth/signin")
                      }
                    >
                      {isCurrentPlan
                        ? "Current Plan"
                        : session
                          ? "Downgrade"
                          : "Get Started Free"}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={isPopular ? "default" : "outline"}
                      disabled={isCurrentPlan || loadingPlan === planKey}
                      onClick={() =>
                        handleUpgrade(planKey as "pro" | "premium")
                      }
                    >
                      {loadingPlan === planKey
                        ? "Loading..."
                        : isCurrentPlan
                          ? "Current Plan"
                          : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
          {session && (
            <Button variant="link" onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}

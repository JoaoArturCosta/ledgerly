"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Progress } from "@/components/ui/progress";
import { Crown, Zap, Settings, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export function SubscriptionCard() {
  const { data: session } = useSession();
  const router = useRouter();

  const { data: subscription } =
    api.subscription.getCurrentSubscription.useQuery();
  const { data: usage } = api.subscription.getUsage.useQuery();

  const createPortalSession = api.subscription.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!session || !subscription) {
    return null;
  }

  const planColors = {
    free: "bg-gray-100 text-gray-800",
    pro: "bg-blue-100 text-blue-800",
    premium: "bg-purple-100 text-purple-800",
  };

  const planIcons = {
    free: TrendingUp,
    pro: Zap,
    premium: Crown,
  };

  const currentPlan = subscription.plan;
  const Icon = planIcons[currentPlan];

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const isNearLimit = (used: number, limit: number) => {
    if (limit === -1) return false;
    return used / limit >= 0.8;
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`rounded-full p-2 ${
                currentPlan === "free"
                  ? "bg-gray-100"
                  : currentPlan === "pro"
                    ? "bg-blue-100"
                    : "bg-purple-100"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  currentPlan === "free"
                    ? "text-gray-600"
                    : currentPlan === "pro"
                      ? "text-blue-600"
                      : "text-purple-600"
                }`}
              />
            </div>
            <div>
              <CardTitle className="text-lg">Your Plan</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </div>
          </div>
          <Badge className={planColors[currentPlan]}>
            {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Usage Statistics */}
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Transactions</span>
              <span>
                {usage?.transactions ?? 0}
                {subscription.limits.transactions === -1
                  ? "/∞"
                  : `/${subscription.limits.transactions}`}
              </span>
            </div>
            <Progress
              value={getUsagePercentage(
                usage?.transactions ?? 0,
                subscription.limits.transactions,
              )}
              className={`h-2 ${isNearLimit(usage?.transactions ?? 0, subscription.limits.transactions) ? "bg-red-100" : ""}`}
            />
          </div>

          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Savings Goals</span>
              <span>
                {usage?.savingsGoals ?? 0}
                {subscription.limits.savingsGoals === -1
                  ? "/∞"
                  : `/${subscription.limits.savingsGoals}`}
              </span>
            </div>
            <Progress
              value={getUsagePercentage(
                usage?.savingsGoals ?? 0,
                subscription.limits.savingsGoals,
              )}
              className={`h-2 ${isNearLimit(usage?.savingsGoals ?? 0, subscription.limits.savingsGoals) ? "bg-red-100" : ""}`}
            />
          </div>

          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Bank Connections</span>
              <span>
                {usage?.bankConnections ?? 0}
                {subscription.limits.bankConnections === -1
                  ? "/∞"
                  : `/${subscription.limits.bankConnections}`}
              </span>
            </div>
            <Progress
              value={getUsagePercentage(
                usage?.bankConnections ?? 0,
                subscription.limits.bankConnections,
              )}
              className={`h-2 ${isNearLimit(usage?.bankConnections ?? 0, subscription.limits.bankConnections) ? "bg-red-100" : ""}`}
            />
          </div>
        </div>

        {/* Feature Access */}
        <div className="border-t pt-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <div
                className={`mr-2 h-2 w-2 rounded-full ${subscription.limits.historicalData ? "bg-green-500" : "bg-gray-300"}`}
              />
              Historical Data
            </div>
            <div className="flex items-center">
              <div
                className={`mr-2 h-2 w-2 rounded-full ${subscription.limits.aiInsights ? "bg-green-500" : "bg-gray-300"}`}
              />
              AI Insights
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="space-x-2">
        {currentPlan === "free" ? (
          <Button className="flex-1" onClick={() => router.push("/pricing")}>
            <Crown className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => createPortalSession.mutate()}
              disabled={createPortalSession.isLoading}
            >
              <Settings className="mr-2 h-4 w-4" />
              {createPortalSession.isLoading ? "Loading..." : "Manage"}
            </Button>
            {currentPlan === "pro" && (
              <Button
                className="flex-1"
                onClick={() => router.push("/pricing")}
              >
                <Crown className="mr-2 h-4 w-4" />
                Upgrade
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}

export default SubscriptionCard;

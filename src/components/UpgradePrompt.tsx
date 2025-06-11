"use client";

import { useRouter } from "next/navigation";
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
import { Crown, Zap, ArrowRight } from "lucide-react";

interface UpgradePromptProps {
  title: string;
  description: string;
  feature: string;
  currentUsage?: number;
  limit?: number;
  className?: string;
}

export function UpgradePrompt({
  title,
  description,
  feature,
  currentUsage,
  limit,
  className,
}: UpgradePromptProps) {
  const router = useRouter();

  return (
    <Card
      className={`border-amber-200 bg-amber-50 dark:bg-amber-950/20 ${className}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
              <Crown className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            {currentUsage !== undefined && limit !== undefined
              ? `${currentUsage}/${limit === -1 ? "∞" : limit}`
              : "Limit Reached"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 rounded-lg border bg-white p-3 dark:bg-gray-800">
            <Zap className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium">Pro Plan</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unlimited {feature.toLowerCase()} + priority support
              </p>
            </div>
            <div className="ml-auto">
              <span className="font-bold">$12/month</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-lg border bg-gradient-to-r from-purple-50 to-blue-50 p-3 dark:from-purple-900/20 dark:to-blue-900/20">
            <Crown className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium">Premium Plan</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Everything + AI insights + unlimited banking
              </p>
            </div>
            <div className="ml-auto">
              <span className="font-bold">$29/month</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="space-x-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/pricing")}
        >
          View All Plans
        </Button>
        <Button
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          onClick={() => router.push("/pricing")}
        >
          Upgrade Now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default UpgradePrompt;

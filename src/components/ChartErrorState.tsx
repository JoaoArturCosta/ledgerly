"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChartErrorStateProps {
  errors: string[];
  warnings?: string[];
  onRetry?: () => void;
  showDetails?: boolean;
}

export function ChartErrorState({
  errors,
  warnings = [],
  onRetry,
  showDetails = process.env.NODE_ENV === "development",
}: ChartErrorStateProps) {
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  if (!hasErrors && !hasWarnings) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed bg-muted/50 p-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-muted-foreground">
            No data available
          </h3>
          <p className="mt-1 text-sm text-muted-foreground/80">
            There is no data to display in this chart.
          </p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Chart Error</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {errors.map((error, index) => (
                <div key={index} className="text-sm">
                  • {error}
                </div>
              ))}
            </div>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-3"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {hasWarnings && showDetails && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Chart Warnings</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {warnings.map((warning, index) => (
                <div key={index} className="text-sm">
                  • {warning}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export function ChartLoadingState({ height }: { height: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg bg-muted/20"
      style={{ height }}
    >
      <div className="text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-2 text-sm text-muted-foreground">Loading chart...</p>
      </div>
    </div>
  );
}

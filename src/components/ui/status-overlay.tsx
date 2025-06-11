import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatusOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  status?: "coming-soon" | "beta" | "new" | "disabled" | "maintenance";
  variant?: "subtle" | "prominent" | "minimal";
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "center";
  overlayOpacity?: "light" | "medium" | "heavy";
  children?: React.ReactNode;
  customText?: string;
}

const statusConfig = {
  "coming-soon": {
    text: "Coming Soon",
    badgeClass:
      "bg-slate-900/90 text-white dark:bg-white/90 dark:text-slate-900",
  },
  beta: {
    text: "Beta",
    badgeClass:
      "bg-orange-600/90 text-white dark:bg-orange-500/90 dark:text-white",
  },
  new: {
    text: "New",
    badgeClass:
      "bg-green-600/90 text-white dark:bg-green-500/90 dark:text-white",
  },
  disabled: {
    text: "Disabled",
    badgeClass: "bg-red-600/90 text-white dark:bg-red-500/90 dark:text-white",
  },
  maintenance: {
    text: "Maintenance",
    badgeClass:
      "bg-yellow-600/90 text-white dark:bg-yellow-500/90 dark:text-slate-900",
  },
};

const positionClasses = {
  "top-right": "right-3 top-3",
  "top-left": "left-3 top-3",
  "bottom-right": "right-3 bottom-3",
  "bottom-left": "left-3 bottom-3",
  center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
};

const overlayOpacityClasses = {
  light: "bg-white/5 backdrop-blur-[0.5px] dark:bg-slate-900/5",
  medium: "bg-white/10 backdrop-blur-[1px] dark:bg-slate-900/10",
  heavy: "bg-white/20 backdrop-blur-[2px] dark:bg-slate-900/20",
};

const variantClasses = {
  subtle: "px-3 py-1 text-xs",
  prominent: "px-4 py-2 text-sm",
  minimal: "px-2 py-1 text-xs",
};

const StatusOverlay = React.forwardRef<HTMLDivElement, StatusOverlayProps>(
  (
    {
      className,
      status = "coming-soon",
      variant = "subtle",
      position = "top-right",
      overlayOpacity = "medium",
      customText,
      children,
      ...props
    },
    ref,
  ) => {
    const config = statusConfig[status];
    const displayText = customText ?? config.text;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute inset-0 z-10",
          overlayOpacityClasses[overlayOpacity],
          className,
        )}
        {...props}
      >
        <div className={cn("absolute", positionClasses[position])}>
          <div
            className={cn(
              "rounded-full font-semibold backdrop-blur-sm",
              config.badgeClass,
              variantClasses[variant],
            )}
          >
            {displayText}
          </div>
        </div>
        {children}
      </div>
    );
  },
);
StatusOverlay.displayName = "StatusOverlay";

export { StatusOverlay };

import { DollarSign, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "header" | "sidebar" | "footer" | "signin";
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  isCollapsed?: boolean;
}

export default function Logo({
  variant = "header",
  className,
  iconClassName,
  textClassName,
  isCollapsed = false,
}: LogoProps) {
  const variants = {
    header: {
      icon: DollarSign,
      iconSize: "h-8 w-8",
      iconColor: "text-blue-600",
      textSize: "text-2xl",
      textColor: "text-slate-900 dark:text-white",
    },
    sidebar: {
      icon: Boxes,
      iconSize: "h-8 w-8",
      iconColor: "",
      textSize: "text-lg",
      textColor: "",
    },
    footer: {
      icon: DollarSign,
      iconSize: "h-6 w-6",
      iconColor: "text-blue-400",
      textSize: "text-xl",
      textColor: "text-white",
    },
    signin: {
      icon: Boxes,
      iconSize: "h-12 w-12",
      iconColor: "",
      textSize: "text-3xl",
      textColor: "",
    },
  };

  const config = variants[variant];
  const IconComponent = config.icon;

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <IconComponent
        className={cn(config.iconSize, config.iconColor, iconClassName)}
      />
      {!isCollapsed && (
        <span
          className={cn(
            "font-sans font-bold tracking-tighter",
            config.textSize,
            config.textColor,
            textClassName,
          )}
          style={{ letterSpacing: "-0.05em" }}
        >
          Kleero®
        </span>
      )}
    </div>
  );
}

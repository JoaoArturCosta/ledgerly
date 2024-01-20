import { type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  color?: string;
  isChidren?: boolean;
  children?: NavItem[];
}

export interface IBarChartData {
  name: string;
  // [key: string]: number | string;
  Total: number;
}

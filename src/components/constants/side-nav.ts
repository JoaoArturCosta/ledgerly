import {
  ArrowUpDown,
  Banknote,
  GanttChart,
  Layers,
  LayoutDashboard,
  PiggyBank,
  Receipt,
} from "lucide-react";
import { type NavItem } from "@/types";

export const NavItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Income & Expenses",
    icon: ArrowUpDown,
    href: "/expenses/overview",
    children: [
      {
        title: "Overview",
        icon: GanttChart,
        href: "/expenses/overview",
      },
      {
        title: "Income",
        icon: Banknote,
        href: "/expenses/income",
      },
      {
        title: "Expenses",
        icon: Receipt,
        href: "/expenses/expenses",
      },
      {
        title: "Savings",
        icon: PiggyBank,
        href: "/expenses/savings",
      },
    ],
  },
  {
    title: "Assets & Goals",
    icon: Layers,
    href: "/assets",
  },
  // {
  //   title: "TodoList",
  //   icon: ListTodo,
  //   href: "/todolist",
  //   color: "text-orange-500",
  //   isChidren: true,
  //   children: [
  //     {
  //       title: "Todo1",
  //       icon: ListTodo,
  //       color: "text-red-500",
  //       href: "/todolist/todo1",
  //     },
  //     {
  //       title: "Todo2",
  //       icon: ListTodo,
  //       color: "text-green-500",
  //       href: "/todolist/todo2",
  //     },
  //     {
  //       title: "Todo3",
  //       icon: ListTodo,
  //       color: "text-blue-500",
  //       href: "/todolist/todo3",
  //     },
  //   ],
  // },
];

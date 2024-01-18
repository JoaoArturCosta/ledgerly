import { ExpensesDialog } from "@/components/ExpensesDialog";
import { IncomeDialog } from "@/components/IncomeDialog";
import Layout from "@/components/Layout";
import { VIEWS_LIST } from "@/components/constants/expenses";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, PiggyBank, Receipt } from "lucide-react";
import { type ReadonlyURLSearchParams } from "next/navigation";

interface ExpensesProps {
  searchParams: ReadonlyURLSearchParams;
}

const Expenses = ({ searchParams }: ExpensesProps) => {
  const cardsList = [
    {
      title: "Total Income",
      value: "$ 1000",
      icon: DollarSign,
      action: IncomeDialog,
    },
    {
      title: "Total Expenses",
      value: "$ 1000",
      icon: Receipt,
      action: ExpensesDialog,
    },
    {
      title: "Total Savings",
      value: "$ 1000",
      icon: PiggyBank,
    },
  ];

  return (
    <Layout title="Income & Expenses" viewsList={VIEWS_LIST}>
      <section className="flex gap-4 pt-10">
        {cardsList.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardDescription>
                <span className="flex items-center gap-20">
                  {card.title}
                  <card.icon className="h-4 w-4" />
                </span>
              </CardDescription>
              <CardTitle className="text-3xl">{card.value}</CardTitle>
            </CardHeader>
            <CardContent>{card.action && <card.action />}</CardContent>
          </Card>
        ))}
      </section>
    </Layout>
  );
};

export default Expenses;

import CreateSavingDialog from "@/components/CreateSavingDialog";
import { DataBarChart } from "@/components/DataBarChart";
import { DynamicFaIcon } from "@/components/DynamicFaIcon";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/server";
import { format } from "date-fns";
import { DollarSign, PiggyBank, Receipt, X } from "lucide-react";
import { useMemo } from "react";

interface ExpensesProps {
  searchParams: {
    month: string;
  };
}

const Expenses = async ({ searchParams }: ExpensesProps) => {
  const relatedDate = useMemo(() => {
    if (searchParams.month) {
      const date = new Date(format(searchParams.month, "yyyy-MM-dd"));
      // Set to noon to avoid timezone issues
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12,
        0,
        0,
      );
    }

    const date = new Date();
    // Set to noon to avoid timezone issues
    return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0);
  }, [searchParams]);

  const allIncomesForCurrentMonth = await api.income.getIncomesForMonth.query({
    relatedDate: new Date(relatedDate),
  });

  const totalIncome = allIncomesForCurrentMonth.reduce((acc, income) => {
    return acc + parseFloat(income.amount.toString());
  }, 0);

  const allExpensesForCurrentMonth =
    await api.expense.getExpensesForMonth.query({
      relatedDate: new Date(relatedDate),
    });

  const totalExpenses = allExpensesForCurrentMonth.reduce((acc, expense) => {
    return acc + parseFloat(expense.amount.toString());
  }, 0);

  const allSavingsForCurrentMonth = await api.savings.getSavingsForMonth.query({
    relatedDate: new Date(relatedDate),
  });

  const totalSavings = Object.entries(allSavingsForCurrentMonth).reduce(
    (acc, saving) => {
      return acc + saving[1];
    },
    0,
  );

  const cardsList = [
    {
      title: "Total Income",
      value: `$ ${totalIncome}`,
      icon: DollarSign,
      description: `in ${format(relatedDate, "MMMM yyyy")}`,
      action: IncomeDialog,
    },
    {
      title: "Total Expenses",
      value: `$ ${totalExpenses}`,
      icon: Receipt,
      description: `Expenses Rate: ${Math.round(
        (totalExpenses / totalIncome) * 100,
      )}%`,
      action: ExpensesDialog,
    },
    {
      title: "Total Savings",
      value: `$ ${totalSavings}`,
      icon: PiggyBank,
      description: `Savings Rate: ${Math.round(
        (totalSavings / totalIncome) * 100,
      )}%`,
      action: CreateSavingDialog,
    },
  ];

  const barChartData = [
    {
      name: "Income",
      Total: Math.round(totalIncome * 100) / 100, // Fix floating-point precision
    },
    {
      name: "Expenses",
      Total: Math.round(totalExpenses * 100) / 100,
    },
    {
      name: "Savings",
      Total: Math.round(totalSavings * 100) / 100,
    },
    {
      name: "Unallocated",
      Total:
        Math.round((totalIncome - (totalExpenses + totalSavings)) * 100) / 100,
    },
  ];

  const refetchSavingsList = async () => {
    "use server";
    return;
  };

  return (
    <Layout title="Income & Expenses" viewsList={VIEWS_LIST}>
      <section className="grid grid-cols-4 gap-4 pt-4">
        {cardsList.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle className="text-sm font-normal tracking-tight text-primary dark:text-accent-foreground">
                <span className="flex items-center gap-28 ">
                  {card.title}
                  <card.icon className="h-4 w-4" />
                </span>
              </CardTitle>
              <CardDescription className="text-normal text-3xl font-bold">
                {card.value}
                {card.description && (
                  <p className="text-xs font-normal text-muted-foreground">
                    {card.description}
                  </p>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {card.action && (
                <card.action refetchSavingsList={refetchSavingsList} />
              )}
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal tracking-tight text-primary dark:text-accent-foreground">
              <span className="flex items-center gap-28 ">
                Total Remaining
                <X className="h-4 w-4" />
              </span>
            </CardTitle>
            <CardDescription className="text-normal text-3xl font-bold">
              ${(totalIncome - totalExpenses).toFixed(2)}
              <p className="text-xs font-normal text-muted-foreground">
                Total Allocated ${(totalExpenses + totalSavings).toFixed(2)}
              </p>
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
      <section className="grid grid-flow-col grid-cols-8 gap-4 pt-4">
        <div className="col-span-5 ">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <DataBarChart
                data={barChartData}
                categoryKey="name"
                valueKey="Total"
                height={400}
                truncateLabel={false}
              />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-3  ">
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allExpensesForCurrentMonth.slice(0, 10).map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <DynamicFaIcon
                            name={expense.expenseSubCategory.iconFaName}
                            className="h-4 w-4"
                          />
                          {expense.description ??
                            expense.expenseSubCategory.name}
                        </span>
                      </TableCell>
                      <TableCell>{expense.amount} $</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Expenses;

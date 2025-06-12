import { DataBarChart } from "@/components/DataBarChart";
import DataLineChart from "@/components/DataLineChart";
import { ExpensesDialog } from "@/components/ExpensesDialog";
import { Columns } from "@/components/DataTable/Definitions/ExpensesColumns";
import { ExpensesTable } from "@/components/DataTable/ExpensesTable";
import Layout from "@/components/Layout";
import { VIEWS_LIST } from "@/components/constants/expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/server";
import { type IBarChartData } from "@/types";
import { format } from "date-fns";
import { Receipt } from "lucide-react";
import { useMemo } from "react";

interface ExpensesProps {
  searchParams: {
    month: string;
  };
}

export default async function Expenses({ searchParams }: ExpensesProps) {
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

  const allExpensesForCurrentMonth =
    await api.expense.getExpensesForMonth.query({
      relatedDate: new Date(relatedDate),
    });

  const barChartData = allExpensesForCurrentMonth.reduce(
    (acc: IBarChartData[], expense) => {
      const expenseCategory = expense.expenseCategory.name!;
      const amount = expense.amount;

      if (acc.some((item) => item.name === expenseCategory) === false) {
        return [
          ...acc,
          {
            name: expenseCategory,
            Total: amount,
          },
        ];
      }

      const index = acc.findIndex((item) => item.name === expenseCategory);

      if (acc[index] === undefined) {
        return acc;
      }

      return acc;
    },
    [] as IBarChartData[],
  );

  const expensesByMonth = await api.expense.getExpensesForYearByMonth.query({
    relatedDate: new Date(relatedDate),
  });

  const lineChartData = Object.entries(expensesByMonth).map((income) => {
    return {
      name: income[0],
      Salary: 0,
      Bonus: 0,
      Freelance: 0,
      Dividends: 0,
      Interest: 0,
      "Business Profits": 0,
      Other: 0,
      ...income[1],
    };
  });

  return (
    <Layout title="Income & Expenses" viewsList={VIEWS_LIST}>
      <section className="grid  grid-cols-8 gap-4  pt-4">
        <Card className=" col-span-5">
          <CardHeader>
            <CardTitle className=" font-normal tracking-tight">
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2 ">
                  <Receipt className="h-4 w-4" />
                  Your Expenses in {format(relatedDate, "MMMM yyyy")}
                </span>
                <ExpensesDialog />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesTable
              columns={Columns}
              data={allExpensesForCurrentMonth}
            />
          </CardContent>
        </Card>
        <div className="col-span-3 grid grid-flow-row grid-rows-2 gap-4 ">
          <Card className="row-span-1">
            <CardHeader>
              <CardTitle className="  font-normal tracking-tight">
                Expenses Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataBarChart data={barChartData} height={240} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className=" font-normal tracking-tight">
                Expenses Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataLineChart data={lineChartData} height={240} />
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

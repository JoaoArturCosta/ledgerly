import { DataBarChart } from "@/components/DataBarChart";
import DataLineChart from "@/components/DataLineChart";
import { DynamicFaIcon } from "@/components/DynamicFaIcon";
import { IncomeDialog } from "@/components/IncomeDialog";
import Layout from "@/components/Layout";
import { VIEWS_LIST } from "@/components/constants/expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/server";
import { type IBarChartData } from "@/types";
import { format } from "date-fns";
import { DollarSign } from "lucide-react";
import { useMemo } from "react";

interface ExpensesProps {
  searchParams: {
    month: string;
  };
}

export async function Income({ searchParams }: ExpensesProps) {
  const relatedDate = useMemo(() => {
    if (searchParams.month) {
      const date = new Date(format(searchParams.month, "yyyy-MM-dd"));
      return date;
    }

    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }, [searchParams]);

  const allIncomesForCurrentMonth = await api.income.getIncomesByMonth.query({
    relatedDate: new Date(relatedDate),
  });

  const incomesByMonth = await api.income.getIncomesByYear.query({
    relatedDate: new Date(relatedDate),
  });

  const lineChartData = Object.entries(incomesByMonth).map((income) => {
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

  const barChartData = allIncomesForCurrentMonth.reduce(
    (acc: IBarChartData[], income) => {
      const incomeCategory = income.incomeCategory.name!;
      const amount = income.amount;

      if (acc.some((item) => item.name === incomeCategory) === false) {
        return [
          ...acc,
          {
            name: incomeCategory,
            Total: amount,
          },
        ];
      }

      const index = acc.findIndex((item) => item.name === incomeCategory);

      if (acc[index] === undefined) {
        return acc;
      }

      acc[index]!.Total += amount;

      return acc;
    },

    [] as IBarChartData[],
  );

  const totalIncome = allIncomesForCurrentMonth.reduce((acc, income) => {
    return acc + income.amount;
  }, 0);

  return (
    <Layout title="Income & Expenses" viewsList={VIEWS_LIST}>
      <section className="grid  grid-cols-8 gap-4  pt-10">
        <Card className=" col-span-5">
          <CardHeader>
            <CardTitle className=" font-normal tracking-tight">
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2 ">
                  <DollarSign className="h-4 w-4" />
                  Your Income in {format(relatedDate, "MMMM yyyy")}
                </span>
                <IncomeDialog />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allIncomesForCurrentMonth.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <DynamicFaIcon
                          name={income.incomeCategory.iconFaName}
                          className="h-4 w-4"
                        />
                        {income.incomeCategory.name}
                      </span>
                    </TableCell>
                    <TableCell className=" text-right">
                      ${income.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">${totalIncome}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
        <div className="col-span-3 grid grid-flow-row grid-rows-2 gap-4 ">
          <Card className="row-span-1">
            <CardHeader>
              <CardTitle className="  font-normal tracking-tight">
                Income Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataBarChart data={barChartData} height={240} maxBars={7} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className=" font-normal tracking-tight">
                Income Progress
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

export default Income;

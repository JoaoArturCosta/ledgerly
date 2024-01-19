import { DataBarChart } from "@/components/DataBarChart";
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
import { format } from "date-fns";
import { DollarSign } from "lucide-react";
import { useMemo } from "react";

interface ExpensesProps {
  searchParams: {
    month: string;
  };
}

interface IncomeOverviewBarChartData {
  name: string;
  [key: string]: number | string;
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

  const allIncomes = await api.income.getIncomesByMonth.query({
    relatedDate: new Date(relatedDate),
  });

  const barChartData = allIncomes.reduce(
    (acc: IncomeOverviewBarChartData, income) => {
      const incomeCategory = income.incomeCategory.name!;
      const amount = income.amount;

      if (acc[incomeCategory] === undefined) {
        return {
          ...acc,
          [incomeCategory]: amount,
        };
      }

      return {
        ...acc,
        [incomeCategory]: Number(acc[incomeCategory]) + amount,
      };
    },
    {
      name: format(relatedDate, "MMMM yyyy"),
    } as IncomeOverviewBarChartData,
  );

  const totalIncome = allIncomes.reduce((acc, income) => {
    return acc + income.amount;
  }, 0);

  return (
    <Layout title="Income & Expenses" viewsList={VIEWS_LIST}>
      <section className="grid  grid-cols-8 gap-4  pt-10">
        <Card className="min-h[ col-span-5">
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
                {allIncomes.map((income) => (
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
              <DataBarChart data={[barChartData]} height={240} maxBars={7} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className=" font-normal tracking-tight">
                Income Progress
              </CardTitle>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

export default Income;

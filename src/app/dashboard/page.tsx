import { DataBarChart } from "@/components/DataBarChart";
import DataLineChart from "@/components/DataLineChart";
import Layout from "@/components/Layout";
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/server";
import { format } from "date-fns";
import { Banknote, CandlestickChart, PiggyBank, Receipt } from "lucide-react";
import { useMemo } from "react";

interface DashboardProps {
  searchParams: {
    month: string;
  };
}

export default async function Dashboard({ searchParams }: DashboardProps) {
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

  const savingsByMonth = await api.savings.getAllSavingsByMonth.query();

  const netWorthChartData = Object.entries(savingsByMonth).map((saving) => {
    return {
      name: saving[0],
      Total: saving[1].Total,
    };
  });

  if (netWorthChartData.length === 1) {
    netWorthChartData.unshift({
      name: "Start",
      Total: 1,
    });
  }

  const currentMonthKey = format(relatedDate, "MMMM yyyy");
  const currentMonthData = savingsByMonth[currentMonthKey];
  const networthTotal = currentMonthData?.Total ?? 0;

  const incomesByMonth = await api.income.getIncomesByYear.query({
    relatedDate: new Date(relatedDate),
  });

  const incomesChartData = Object.entries(incomesByMonth).map((income) => {
    return {
      name: income[0],
      Total: income[1]?.Total ?? 0,
    };
  });

  if (incomesChartData.length === 1) {
    incomesChartData.unshift({
      name: "Start",
      Total: 0,
    });
  }

  const incomesTotal = Object.entries(incomesByMonth).reduce((acc, income) => {
    return acc + (income[1]?.Total ?? 0);
  }, 0);

  const allExpensesForCurrentYear =
    await api.expense.getExpensesForYearByCategory.query({
      relatedDate: new Date(relatedDate),
    });

  const allExpensesForCurrentYearByMonth =
    await api.expense.getExpensesForYearByMonth.query({
      relatedDate: new Date(relatedDate),
    });

  const expensesBarChartData = Object.entries(allExpensesForCurrentYear).map(
    (expense) => {
      return {
        name: expense[0],
        Total: expense[1]?.Total ?? 0,
      };
    },
  );

  const expensesTotal = Object.entries(allExpensesForCurrentYear).reduce(
    (acc, expense) => {
      return acc + (expense[1]?.Total ?? 0);
    },
    0,
  );

  const allSavingsByCategory = await api.savings.getSavingsByCategory.query();

  const savingsBarChartData = Object.entries(allSavingsByCategory).map(
    (saving) => {
      return {
        name: saving[0],
        Total: saving[1]?.Total ?? 0,
      };
    },
  );

  const savingsTotal = Object.entries(allSavingsByCategory).reduce(
    (acc, saving) => {
      return acc + (saving[1]?.Total ?? 0);
    },
    0,
  );

  const savingsWithdrawalsForYear =
    await api.savings.getSavingsWithdrawalsForYearByMonth.query({
      relatedDate: new Date(relatedDate),
    });

  const totalWithdrawals = Object.entries(savingsWithdrawalsForYear).reduce(
    (acc, saving) => {
      return acc + (saving[1]?.Total ?? 0);
    },
    0,
  );

  return (
    <Layout title="Annual Overview" noDatePicker>
      <section className="grid  grid-cols-4 gap-2  pt-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="font-normal tracking-tight">
              <span className="flex items-center gap-2 ">
                <CandlestickChart className="h-4 w-4" />
                Total Net Worth
              </span>
            </CardTitle>
            <CardDescription className="text-normal text-3xl font-bold">
              ${networthTotal.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataLineChart data={netWorthChartData} height={178} noYAxis />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="font-normal tracking-tight">
              <span className="flex items-center gap-2 ">
                <Banknote className="h-4 w-4" />
                Total Income
              </span>
            </CardTitle>
            <CardDescription className="text-normal text-3xl font-bold">
              ${incomesTotal.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataLineChart
              data={incomesChartData}
              height={178}
              noXAxis
              noYAxis
            />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className=" font-normal tracking-tight">
              <span className="flex items-center gap-2 ">
                <Receipt className="h-4 w-4" />
                Expenses Distribution
              </span>
            </CardTitle>
            <CardDescription className="text-normal text-3xl font-bold">
              ${expensesTotal.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataBarChart
              data={expensesBarChartData}
              height={178}
              orientation="vertical"
              xDataKey="Total"
              yDataKey="name"
            />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className=" font-normal tracking-tight">
              <span className="flex items-center gap-2 ">
                <PiggyBank className="h-4 w-4" />
                Savings Distribution
              </span>
            </CardTitle>
            <CardDescription className="text-normal text-3xl font-bold">
              ${savingsTotal.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataBarChart
              data={savingsBarChartData}
              height={178}
              orientation="vertical"
              xDataKey="Total"
              yDataKey="name"
            />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="  font-bold tracking-tight">
              Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Incomes
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{incomesTotal} $</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Expenses
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {expensesTotal} $
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <PiggyBank className="h-4 w-4" />
                      Savings & Investments
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{savingsTotal} $</TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    $
                    {incomesTotal +
                      savingsTotal -
                      expensesTotal -
                      totalWithdrawals}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className=" font-bold tracking-tight">
              Total Incomes by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(incomesByMonth).map((income) => (
                  <TableRow key={income[0]}>
                    <TableCell>{income[0]}</TableCell>
                    <TableCell className="text-right">
                      {income[1]?.Total ?? 0} $
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{incomesTotal} $</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className=" font-bold tracking-tight">
              Total Expenses by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(allExpensesForCurrentYearByMonth).map(
                  (expense) => (
                    <TableRow key={expense[0]}>
                      <TableCell>{expense[0]}</TableCell>
                      <TableCell className="text-right">
                        {expense[1]?.Total ?? 0} $
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {expensesTotal} $
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className=" font-bold tracking-tight">
              Total Savings by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(savingsByMonth).map((saving) => (
                  <TableRow key={saving[0]}>
                    <TableCell>{saving[0]}</TableCell>
                    <TableCell className="text-right">
                      {saving[1]?.Total ?? 0} $
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{savingsTotal} $</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}

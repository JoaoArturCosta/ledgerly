import CreateSavingDialog from "@/components/CreateSavingDialog";
import { DataBarChart } from "@/components/DataBarChart";
import DataLineChart from "@/components/DataLineChart";
import { ExpensesDialog } from "@/components/ExpensesDialog";
import Layout from "@/components/Layout";
import SavingsCarousel from "@/components/SavingsCarousel";
import { VIEWS_LIST } from "@/components/constants/expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/server";
import { type IBarChartData } from "@/types";
import { format } from "date-fns";
import { Receipt } from "lucide-react";
import React, { useMemo } from "react";

interface SavingsProps {
  searchParams: {
    month: string;
  };
}

export default async function Savings({ searchParams }: SavingsProps) {
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

  const allSavings = await api.savings.getAllSavings.query();

  const refetch = async () => {
    "use server";
    null;
  };

  const savingsForCurrentMonth = await api.savings.getSavingsForMonth.query({
    relatedDate: new Date(relatedDate),
  });

  const savingsByMonth = await api.savings.getAllSavingsByMonth.query();

  const lineChartData = Object.entries(savingsByMonth).map((saving) => {
    return {
      name: saving[0],
      ...saving[1],
    };
  });

  const allSavingsBarChartData = allSavings.reduce(
    (acc: IBarChartData[], saving) => {
      const savingCategory = saving.savingsCategory.name!;
      const amount = saving.savedAmount;

      if (acc.some((item) => item.name === savingCategory) === false) {
        return [
          ...acc,
          {
            name: savingCategory,
            Total: amount,
          },
        ];
      }

      const index = acc.findIndex((item) => item.name === savingCategory);

      if (acc[index] === undefined) {
        return acc;
      }

      acc[index]!.Total += amount;

      return acc;
    },
    [] as IBarChartData[],
  );

  const savingsForCurrentMonthBarChartData = Object.entries(
    savingsForCurrentMonth,
  ).map((saving) => {
    return {
      name: saving[0],
      Total: saving[1],
    };
  });

  return (
    <Layout title="Savings & Investments" viewsList={VIEWS_LIST}>
      <section className="flex w-full">
        <CreateSavingDialog
          className="absolute left-[400px] top-[100px]"
          refetchSavingsList={refetch}
        />
        <SavingsCarousel savings={allSavings} />
      </section>
      <section className="grid  grid-cols-8 gap-2  pt-4">
        <div className="col-span-3 grid grid-flow-row grid-rows-2 gap-2 ">
          <Card className="row-span-1">
            <CardHeader>
              <CardTitle className="  font-normal tracking-tight">
                Savings & Investments Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataBarChart data={allSavingsBarChartData} height={150} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className=" font-normal tracking-tight">
                Savings & Investments Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataLineChart data={lineChartData} height={150} />
            </CardContent>
          </Card>
        </div>
        <Card className=" col-span-5">
          <CardHeader>
            <CardTitle className=" font-normal tracking-tight">
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2 ">
                  <Receipt className="h-4 w-4" />
                  Your Savings & Investments in{" "}
                  {format(relatedDate, "MMMM yyyy")}
                </span>
                <ExpensesDialog />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataBarChart
              data={savingsForCurrentMonthBarChartData}
              height={380}
            />
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}

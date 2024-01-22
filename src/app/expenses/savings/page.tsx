import { DataBarChart } from "@/components/DataBarChart";
import DataLineChart from "@/components/DataLineChart";
import { DynamicFaIcon } from "@/components/DynamicFaIcon";
import { ExpensesDialog } from "@/components/ExpensesDialog";
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
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/server";
import { type IBarChartData } from "@/types";
import { format } from "date-fns";
import { PiggyBank, Receipt } from "lucide-react";
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
      return date;
    }

    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }, [searchParams]);

  const allSavings = await api.savings.getAllSavings.query();

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
        <Carousel className="w-full pt-6">
          <CarouselContent>
            {allSavings.map((saving) => (
              <CarouselItem key={saving.id} className="basis-1/4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-end justify-between">
                      <span className="">
                        <DynamicFaIcon
                          name={saving.savingsCategory.iconFaName}
                        />{" "}
                      </span>

                      {saving.finalAmount! > 0 && (
                        <span className="flex gap-1 text-muted-foreground">
                          <PiggyBank className="h-4 w-4" />
                          {`$${saving.finalAmount?.toLocaleString()}`}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="pt-4">
                      <span className="font-bold text-foreground ">
                        {saving.name}
                      </span>{" "}
                      &#x2022; {saving.savingsCategory.name}
                    </CardDescription>
                    <CardContent className="p-0">
                      <div className="flex justify-start text-3xl font-bold">
                        ${saving.savedAmount.toLocaleString()}
                      </div>

                      <div
                        className={cn(
                          "flex justify-between gap-2 ",
                          saving.finalAmount! <= 0 && "invisible",
                        )}
                      >
                        <Progress
                          className="mt-2"
                          value={Math.round(
                            (saving.savedAmount / saving.finalAmount!) * 100,
                          )}
                        />
                        <span className="text-muted-foreground">
                          {Math.round(
                            (saving.savedAmount / saving.finalAmount!) * 100,
                          )}
                          %
                        </span>
                      </div>
                    </CardContent>
                  </CardHeader>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
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
            {/* <ExpensesTable
              columns={Columns}
              data={allExpensesForCurrentMonth}
            /> */}
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}

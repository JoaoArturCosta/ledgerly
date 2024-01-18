"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

interface ViewSelectorProps {
  viewsList: {
    value: string;
    label: string;
  }[];
}

const ViewSelector = ({ viewsList }: ViewSelectorProps) => {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const defaultValue = pathName.split("/")[2];

  const handleViewChange = (value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    // if (!value) {
    //   current.delete("view");
    // } else {
    //   current.set("view", value);
    // }

    const search = current.toString();

    const query = search ? `?${search}` : "";

    router.push(`${value}${query}`);
  };
  return (
    <Tabs defaultValue={defaultValue} onValueChange={handleViewChange}>
      <TabsList>
        {viewsList.map((view) => (
          <TabsTrigger key={view.value} value={view.value}>
            {view.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default ViewSelector;

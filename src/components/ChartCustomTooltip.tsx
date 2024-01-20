export default function ChartCustomTooltip({
  active,
  payload,
  label,
}: {
  active: boolean;
  payload: {
    name: string;
    [key: string]: number | string;
  }[];
  label: string;
}) {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border bg-white p-4 shadow-lg">
        <p className="text-lg font-semibold">{`${label}`}</p>
        <div className="flex max-w-[250px] flex-row flex-wrap gap-x-4 gap-y-2 pt-4">
          {payload.map(
            (item) =>
              item.value !== 0 && (
                <div key={item.dataKey} className=" col-span-1 flex flex-col">
                  <p className="text-xs">{item.name}</p>
                  <p className="text-sm">{`$${item.value}`}</p>
                </div>
              ),
          )}
        </div>
      </div>
    );
  }

  return null;
}

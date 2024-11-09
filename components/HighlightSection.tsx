import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Line } from "react-chartjs-2";

const ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { x: { display: false }, y: { display: false } },
  plugins: { legend: { display: false } },
  elements: { point: { radius: 0 } },
};

// Mock data for charts - in a real app, you'd get this from an API
const mockChartData = Array.from({ length: 24 }, (_, i) => [
  Date.now() - (23 - i) * 3600000,
  Math.random() * 100,
]);

export default function HighlightsSection() {
  const {
    data: globalData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["globalData"],
    queryFn: async () => {
      const response = await fetch("https://api.coingecko.com/api/v3/global");
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    },
  });

  if (isLoading) return <div>Loading highlights...</div>;
  if (error)
    return <div>Error loading highlights: {(error as Error).message}</div>;

  const { data } = globalData;
  const marketCapChange = data.market_cap_change_percentage_24h_usd;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      <Card className="p-4">
        <CardContent className="p-0">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Cryptocurrencies
            </h3>
            <p className="text-base font-bold">
              {data.active_cryptocurrencies}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardContent className="p-0">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="space-y-1.5 min-w-[140px]">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Market Cap
              </h3>
              <p className="text-base font-bold">
                ${data.total_market_cap.usd.toLocaleString()}
              </p>
              <div className="text-xs text-muted-foreground">
                <span
                  className={
                    marketCapChange > 0
                      ? "text-green-500 mr-1"
                      : "text-red-500 mr-1"
                  }
                >
                  {marketCapChange > 0 ? "↑" : "↓"}
                </span>
                <span>{Math.abs(marketCapChange).toFixed(2)}%</span>
              </div>
            </div>
            <div className="w-28 h-12 self-center">
              <Line
                data={{
                  labels: mockChartData.map(([time]) => time),
                  datasets: [
                    {
                      data: mockChartData.map(([, value]) => value),
                      borderColor:
                        marketCapChange > 0
                          ? "rgb(34, 197, 94)"
                          : "rgb(239, 68, 68)",
                      tension: 0.1,
                    },
                  ],
                }}
                options={ChartOptions}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardContent className="p-0">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="space-y-1.5 min-w-[140px]">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                24h Volume
              </h3>
              <p className="text-base font-bold">
                ${data.total_volume.usd.toLocaleString()}
              </p>
            </div>
            <div className="w-28 h-12 self-center">
              <Line
                data={{
                  labels: mockChartData.map(([time]) => time),
                  datasets: [
                    {
                      data: mockChartData.map(([, value]) => value),
                      borderColor: "rgb(75, 192, 192)",
                      tension: 0.1,
                    },
                  ],
                }}
                options={ChartOptions}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

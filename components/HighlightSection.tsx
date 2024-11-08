import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HighlightsSection() {
  const {
    data: globalData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["globalData"],
    queryFn: async () => {
      const response = await fetch("https://api.coingecko.com/api/v3/global");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });

  if (isLoading) return <div>Loading highlights...</div>;
  if (error)
    return <div>Error loading highlights: {(error as Error).message}</div>;

  const { data } = globalData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Cryptocurrencies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.active_cryptocurrencies}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Market Cap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            ${data.total_market_cap.usd.toLocaleString()}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>24h Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            ${data.total_volume.usd.toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

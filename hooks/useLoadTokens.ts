import { useQuery } from "@tanstack/react-query";

interface Token {
  image: string;
  current_price: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_24h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  total_volume: number;
  market_cap: number;
  sparkline_in_7d: { price: number[] };
  name: string;
}

export const useLoadTokens = () => {
  const {
    data: tokens,
    isLoading,
    error,
  } = useQuery<Token[]>(["tokens"], async () => {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  });

  return { tokens, isLoading, error };
};

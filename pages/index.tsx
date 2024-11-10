import CustomizeViewModal from "@/components/CustomizeViewModal";
import HighlightsSection from "@/components/HighlightSection";
import TokenTable from "@/components/TokenTable";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";

const currentViewAtom = atom("Trending");
const savedViewsAtom = atom<string[]>([]);

export default function Home() {
  const [currentView, setCurrentView] = useAtom(currentViewAtom);
  const [savedViews, setSavedViews] = useAtom(savedViewsAtom);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [progress, setProgress] = useState(13);

  const {
    data: tokens,
    isLoading,
    error,
  } = useQuery(["tokens"], async () => {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  });

  useEffect(() => {
    const storedViews = localStorage.getItem("savedViews");
    if (storedViews) {
      setSavedViews(JSON.parse(storedViews));
    }
  }, [setSavedViews]);

  useEffect(() => {
    localStorage.setItem("savedViews", JSON.stringify(savedViews));
  }, [savedViews]);

  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          // Fast at start, slower as it progresses
          const remaining = 90 - prev;
          const increment = Math.max(0.1, remaining * 0.1);
          const next = prev + increment;
          return next >= 90 ? 90 : next;
        });
      }, 50);
      return () => clearInterval(timer);
    } else {
      setProgress(13);
    }
  }, [isLoading]);

  if (isLoading)
    return (
      <div className="container mx-auto p-4 flex flex-col gap-2 justify-center items-center min-h-screen">
        <div className="w-[60%] max-w-md">
          <Progress
            value={progress}
            className="h-2 bg-gray-700 [&>div]:bg-white [&>div]:transition-all [&>div]:duration-300"
          />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto p-4">
        An error has occurred: {(error as Error).message}
      </div>
    );

  return (
    <div className="container mx-auto p-4 bg-gray-900/50 min-h-screen text-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-white">Crypto Dashboard</h1>

      <HighlightsSection />

      <Tabs
        value={currentView}
        onValueChange={setCurrentView}
        className="border-gray-700"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger
              value="Trending"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
            >
              Trending
            </TabsTrigger>
            {savedViews.map((view) => (
              <TabsTrigger
                key={view}
                value={view}
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
              >
                {view}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Customize
          </Button>
        </div>

        <TabsContent value="Trending">
          <TokenTable tokens={tokens} view="Trending" />
        </TabsContent>

        {savedViews.map((view) => (
          <TabsContent key={view} value={view}>
            <TokenTable tokens={tokens} view={view} />
          </TabsContent>
        ))}
      </Tabs>

      <CustomizeViewModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        onSave={(viewName, columns) => {
          setSavedViews([...savedViews, viewName]);
          localStorage.setItem(`view_${viewName}`, JSON.stringify(columns));
          setIsCustomizeModalOpen(false);
        }}
      />
    </div>
  );
}

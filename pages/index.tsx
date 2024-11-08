import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import HighlightsSection from "@/components/HighlightSection";
import TokenTable from "@/components/TokenTable";
import CustomizeViewModal from "@/components/CustomizeViewModal";

const currentViewAtom = atom("Trending");
const savedViewsAtom = atom<string[]>([]);

export default function Home() {
  const [currentView, setCurrentView] = useAtom(currentViewAtom);
  const [savedViews, setSavedViews] = useAtom(savedViewsAtom);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

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
  }, []);

  useEffect(() => {
    localStorage.setItem("savedViews", JSON.stringify(savedViews));
  }, [savedViews]);

  if (isLoading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error)
    return (
      <div className="container mx-auto p-4">
        An error has occurred: {(error as Error).message}
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crypto Dashboard</h1>
      <HighlightsSection />
      <Tabs value={currentView} onValueChange={setCurrentView}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="Trending">Trending</TabsTrigger>
            {savedViews.map((view) => (
              <TabsTrigger key={view} value={view}>
                {view}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button onClick={() => setIsCustomizeModalOpen(true)}>
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

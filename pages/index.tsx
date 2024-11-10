import CustomizeViewModal from "@/components/CustomizeViewModal";
import HighlightsSection from "@/components/HighlightSection";
import TokenTable from "@/components/TokenTable";
import { Button } from "@/components/ui/button";
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

  const handleDeleteView = (viewToDelete: string) => {
    setSavedViews(savedViews.filter((view) => view !== viewToDelete));
    localStorage.removeItem(`view_${viewToDelete}`);
    if (currentView === viewToDelete) {
      setCurrentView("Trending");
    }
  };

  if (isLoading)
    return (
      <div className="container mx-auto p-4 flex flex-col gap-2 justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
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
              <div key={view} className="relative inline-flex items-center">
                <TabsTrigger
                  value={view}
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 group"
                >
                  {view}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteView(view);
                    }}
                    className="ml-2 text-gray-500 hover:text-gray-300 focus:outline-none group-data-[state=active]:text-gray-300 group-data-[state=active]:hover:text-gray-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </TabsTrigger>
              </div>
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
        existingViews={savedViews}
        onSave={(viewName, columns) => {
          const trimmedName = viewName.trim();
          if (savedViews.includes(trimmedName)) {
            return; // Extra safety check
          }
          setSavedViews([...savedViews, trimmedName]);
          localStorage.setItem(`view_${trimmedName}`, JSON.stringify(columns));
          setIsCustomizeModalOpen(false);
        }}
      />
    </div>
  );
}

import CustomizeViewModal from "@/components/CustomizeViewModal";
import HighlightsSection from "@/components/HighlightSection";
import TokenTable from "@/components/TokenTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLoadTokens } from "@/hooks/useLoadTokens";
import { atom, useAtom } from "jotai";
import { useEffect, useState, useTransition } from "react";

const currentViewAtom = atom("Trending");
const savedViewsAtom = atom<string[]>([]);

export default function Home() {
  const [currentView, setCurrentView] = useAtom(currentViewAtom);
  const [savedViews, setSavedViews] = useAtom(savedViewsAtom);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Trending");
  const [isPending, startContentTransition] = useTransition();

  const { isLoading, error } = useLoadTokens();

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
        onValueChange={(value) => {
          setSelectedTab(value);

          startContentTransition(() => {
            setCurrentView(value);
          });
        }}
        className="border-gray-700"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4 mb-4">
          <div className="w-full sm:w-auto">
            <TabsList className="bg-gray-900 border border-gray-800 w-full flex flex-wrap items-center h-auto gap-2 p-2 justify-start">
              <TabsTrigger
                value="Trending"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 border border-gray-700 data-[state=inactive]:bg-gray-800/50"
              >
                Trending
                {isPending && selectedTab === "Trending" && (
                  <div className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
              </TabsTrigger>

              {savedViews.map((view) => (
                <div key={view}>
                  <TabsTrigger
                    value={view}
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 group border border-gray-700 data-[state=inactive]:bg-gray-800/50"
                  >
                    {view}
                    {isPending && selectedTab === view ? (
                      <div className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
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
                    )}
                  </TabsTrigger>
                </div>
              ))}
            </TabsList>
          </div>

          <Button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto whitespace-nowrap"
          >
            Customize
          </Button>
        </div>

        <TabsContent value="Trending">
          <TokenTable view="Trending" />
        </TabsContent>

        {savedViews.map((view) => (
          <TabsContent key={view} value={view}>
            <TokenTable view={view} />
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

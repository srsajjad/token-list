import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const availableColumns = [
  { id: "image", label: "Coin" },
  { id: "current_price", label: "Price" },
  { id: "price_change_1h", label: "1h" }, // Updated ID
  { id: "price_change_24h", label: "24h" }, // Updated ID
  { id: "price_change_7d", label: "7d" }, // Updated ID
  { id: "total_volume", label: "24h Volume" },
  { id: "market_cap", label: "Market Cap" },
  { id: "sparkline", label: "Last 7 Days" }, // Updated ID
];

interface CustomizeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (viewName: string, selectedColumns: string[]) => void;
  existingViews: string[]; // Add this prop
}

export default function CustomizeViewModal({
  isOpen,
  onClose,
  onSave,
  existingViews,
}: CustomizeViewModalProps) {
  const [selectedColumns, setSelectedColumns] = useState(
    availableColumns.map((col) => col.id)
  );
  const [viewName, setViewName] = useState("");
  // const [isSaving, setIsSaving] = useState(false);

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleSave = () => {
    if (viewName.trim() === "") {
      alert("Please enter a name for your custom view");
      return;
    }
    if (existingViews.includes(viewName.trim())) {
      alert("A view with this name already exists");
      return;
    }
    // if (isSaving) {
    //   return;
    // }

    // setIsSaving(true);
    onClose();
    onSave(viewName.trim(), selectedColumns);
    // setIsSaving(false);
    // onClose(); // for async calls
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize View</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="view-name"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder="Enter view name"
              className="col-span-3 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400"
            />
          </div>
          {availableColumns.map((column) => (
            <div key={column.id} className="flex items-center space-x-2">
              <Checkbox
                id={column.id}
                checked={selectedColumns.includes(column.id)}
                onCheckedChange={() => handleColumnToggle(column.id)}
                className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label
                htmlFor={column.id}
                className="text-sm font-medium leading-none text-gray-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {column.label}
              </label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            onClick={handleSave}
            // disabled={isSaving || viewName.trim() === ""}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {/* {isSaving ? "Saving..." : "Save View"} */}
            Save View
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

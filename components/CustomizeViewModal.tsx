import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const availableColumns = [
  { id: "image", label: "Coin" },
  { id: "current_price", label: "Price" },
  { id: "price_change_percentage_1h_in_currency", label: "1h" },
  { id: "price_change_percentage_24h", label: "24h" },
  { id: "price_change_percentage_7d_in_currency", label: "7d" },
  { id: "total_volume", label: "24h Volume" },
  { id: "market_cap", label: "Market Cap" },
  { id: "sparkline_in_7d.price", label: "Last 7 Days" },
];

export default function CustomizeViewModal({ isOpen, onClose, onSave }) {
  const [selectedColumns, setSelectedColumns] = useState(
    availableColumns.map((col) => col.id)
  );
  const [viewName, setViewName] = useState("");

  const handleColumnToggle = (columnId) => {
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
    onSave(viewName, selectedColumns);
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save View
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

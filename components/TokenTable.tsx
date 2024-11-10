import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLoadTokens } from "@/hooks/useLoadTokens";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useState } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const columnHelper = createColumnHelper<any>();

const renderPercentageChange = (value: number) => {
  if (!value) return "N/A";
  const isPositive = value > 0;
  return (
    <div className="flex items-center gap-1">
      <span className={isPositive ? "text-green-500" : "text-red-500"}>
        {isPositive ? "↑" : "↓"}
      </span>
      <span>{Math.abs(value).toFixed(2)}%</span>
    </div>
  );
};

const defaultColumns = [
  columnHelper.accessor("image", {
    id: "image",
    header: "Coin",
    enableSorting: false, // Disable sorting for image column
    cell: (info) => (
      <div className="flex items-center">
        <img
          src={info.getValue()}
          alt={info.row.original.name}
          className="w-6 h-6 mr-2"
        />
        <span>{info.row.original.name}</span>
      </div>
    ),
  }),
  columnHelper.accessor("current_price", {
    id: "current_price",
    header: "Price",
    enableSorting: true,
    sortingFn: "alphanumeric",
    cell: (info) => `$${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor("price_change_percentage_1h_in_currency", {
    id: "price_change_1h",
    header: "1h",
    enableSorting: true,
    sortingFn: "alphanumeric",
    cell: (info) => renderPercentageChange(info.getValue()),
  }),
  columnHelper.accessor("price_change_percentage_24h_in_currency", {
    id: "price_change_24h",
    header: "24h",
    enableSorting: true,
    sortingFn: "alphanumeric",
    cell: (info) => renderPercentageChange(info.getValue()),
  }),
  columnHelper.accessor("price_change_percentage_7d_in_currency", {
    id: "price_change_7d",
    header: "7d",
    enableSorting: true,
    sortingFn: "alphanumeric",
    cell: (info) => renderPercentageChange(info.getValue()),
  }),
  columnHelper.accessor("total_volume", {
    id: "total_volume", // Add explicit id
    header: "24h Volume", // Change from function to string
    enableSorting: true,
    sortingFn: "alphanumeric",
    cell: (info) => `$${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor("market_cap", {
    id: "market_cap", // Add explicit id
    header: "Market Cap", // Change from function to string
    enableSorting: true,
    sortingFn: "alphanumeric",
    cell: (info) => `$${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor("sparkline_in_7d.price", {
    id: "sparkline", // Add explicit id
    header: "Last 7 Days", // Change from function to string
    enableSorting: true,
    cell: (info) => (
      <div className="w-32 h-16">
        <Line
          data={{
            labels: Array.from(
              { length: info.getValue().length },
              (_, i) => i + 1
            ),
            datasets: [
              {
                data: info.getValue(),
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { display: false },
              y: { display: false },
            },
            plugins: {
              legend: { display: false },
            },
            elements: {
              point: { radius: 0 },
            },
          }}
        />
      </div>
    ),
  }),
];

function DraggableColumnHeader({ header }: { header: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: header.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "pointer",
  };

  return (
    <TableHead ref={setNodeRef} style={style}>
      <div className="flex items-center gap-2">
        {/* Remove drag handlers from outer div */}
        {header.column.getCanSort() && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              header.column.toggleSorting();
            }}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {
              {
                asc: "↑",
                desc: "↓",
                false: "↕",
              }[(header.column.getIsSorted() as string) ?? false]
            }
          </span>
        )}
        <div {...attributes} {...listeners}>
          {flexRender(header.column.columnDef.header, header.getContext())}
        </div>
      </div>
    </TableHead>
  );
}

export default function TokenTable({ view }: { view: string }) {
  const { tokens = [] } = useLoadTokens();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columns, setColumns] = useState(() => {
    if (view === "Trending") {
      return defaultColumns;
    }
    const savedView = localStorage.getItem(`view_${view}`);
    if (savedView) {
      const savedColumns = JSON.parse(savedView);
      return savedColumns
        .map((columnId: string | undefined) =>
          defaultColumns.find((col) => col.id === columnId)
        )
        .filter(Boolean); // Add this line to filter out undefined columns
    }
    return defaultColumns;
  });

  const table = useReactTable({
    data: tokens,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
    enableMultiSort: false,
    sortingFns: {
      alphanumeric: (rowA, rowB, columnId) => {
        const a =
          parseFloat(rowA.getValue(columnId)) || rowA.getValue(columnId);
        const b =
          parseFloat(rowB.getValue(columnId)) || rowB.getValue(columnId);
        return a < b ? -1 : a > b ? 1 : 0;
      },
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: { active: any; over: any }) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setColumns((prevColumns: any[]) => {
      const oldIndex = prevColumns.findIndex(
        (col) => col.id === active.id || col.accessorKey === active.id
      );
      const newIndex = prevColumns.findIndex(
        (col) => col.id === over.id || col.accessorKey === over.id
      );

      if (oldIndex === -1 || newIndex === -1) {
        return prevColumns;
      }

      return arrayMove(prevColumns, oldIndex, newIndex);
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <SortableContext
              items={columns.map(
                (col: { id: any; accessorKey: any }) =>
                  col.id ?? col.accessorKey ?? ""
              )}
              strategy={verticalListSortingStrategy}
            >
              {table
                .getHeaderGroups()
                .map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <DraggableColumnHeader key={header.id} header={header} />
                  ))
                )}
            </SortableContext>
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DndContext>
  );
}

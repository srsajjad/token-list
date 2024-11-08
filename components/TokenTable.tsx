import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const defaultColumns = [
  columnHelper.accessor("image", {
    header: "Coin",
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
    header: "Price",
    cell: (info) => `$${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor("price_change_percentage_1h_in_currency", {
    header: "1h",
    cell: (info) => `${info.getValue()}%`,
  }),
  columnHelper.accessor("price_change_percentage_24h", {
    header: "24h",
    cell: (info) => `${info.getValue()}%`,
  }),
  columnHelper.accessor("price_change_percentage_7d_in_currency", {
    header: "7d",
    cell: (info) => `${info.getValue()}%`,
  }),
  columnHelper.accessor("total_volume", {
    header: "24h Volume",
    cell: (info) => `$${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor("market_cap", {
    header: "Market Cap",
    cell: (info) => `$${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor("sparkline_in_7d.price", {
    header: "Last 7 Days",
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

function DraggableColumnHeader({ header }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: header.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableHead ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}
    </TableHead>
  );
}

export default function TokenTable({ tokens, view }) {
  const columns = useMemo(() => {
    if (view === "Trending") {
      return defaultColumns;
    }
    const savedView = localStorage.getItem(`view_${view}`);

    if (savedView) {
      const savedColumns = JSON.parse(savedView);

      return savedColumns.map((columnId) =>
        defaultColumns.find((col) => col.id === columnId)
      );
    }
    return defaultColumns;
  }, [view]);

  console.log("columns", columns);

  const [data, setData] = useState(tokens);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setData((items) => {
        const oldIndex = table
          .getAllColumns()
          .findIndex((col) => col.id === active.id);
        const newIndex = table
          .getAllColumns()
          .findIndex((col) => col.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
              items={table.getAllColumns().map((column) => column.id)}
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

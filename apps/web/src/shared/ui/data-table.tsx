import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@autolab/ui/components/table";
import { Skeleton } from "@autolab/ui/components/skeleton";
import { cn } from "@autolab/ui/lib/utils";
import { range } from "@/shared/lib/arrays";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

type Props<T> = {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
  isLoading?: boolean;
};

export const DataTable = <T,>({
  columns,
  data,
  onRowClick,
  emptyMessage = "Нема результатів",
  className,
  isLoading = false,
}: Props<T>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <DataTableSkeleton columns={columns.length} className={className} />;
  }

  return (
    <div
      className={cn(
        "grid h-full min-h-[240px] overflow-hidden rounded-md border bg-card",
        className,
      )}
    >
      <div className="min-h-0 overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead className="h-10" key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={onRowClick ? "cursor-pointer" : undefined}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

type DataTableSkeletonProps = {
  rows?: number;
  columns?: number;
  className?: string;
};

export const DataTableSkeleton = ({
  rows = 8,
  columns = 4,
  className,
}: DataTableSkeletonProps) => (
  <div
    className={cn(
      "grid h-full min-h-[240px] overflow-hidden rounded-md border bg-card",
      className,
    )}
  >
    <div className="min-h-0 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {range(columns).map((index) => (
              <TableHead className="h-10" key={index}>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {range(rows).map((rowIndex) => (
            <TableRow key={rowIndex}>
              {range(columns).map((colIndex) => (
                <TableCell key={colIndex} className="py-3">
                  <Skeleton className={cn("h-4", colIndex === 0 ? "w-40" : "w-24")} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

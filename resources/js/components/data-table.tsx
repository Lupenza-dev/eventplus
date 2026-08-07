import {
    columnFilteringFeature,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    flexRender,
    globalFilteringFeature,
    rowPaginationFeature,
    rowSortingFeature,
    tableFeatures,
    useTable,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

declare module '@tanstack/react-table' {
    interface ColumnMeta<
        TFeatures extends import('@tanstack/react-table').TableFeatures,
        TData extends import('@tanstack/react-table').RowData,
        TValue extends import('@tanstack/react-table').CellData,
    > {
        headerClassName?: string;
        cellClassName?: string;
    }
}

const features = tableFeatures({
    rowSortingFeature,
    sortedRowModel: createSortedRowModel(),
    columnFilteringFeature,
    globalFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    rowPaginationFeature,
    paginatedRowModel: createPaginatedRowModel(),
});

export type DataTableFeatures = typeof features;
export type DataTableColumnDef<TData extends object> = ColumnDef<
    DataTableFeatures,
    TData,
    unknown
>;

type DataTableProps<TData extends object> = {
    columns: ColumnDef<typeof features, TData, unknown>[];
    data: TData[];
    searchPlaceholder?: string;
    emptyMessage?: string;
};

export function DataTable<TData extends object>({
    columns,
    data,
    searchPlaceholder = 'Search...',
    emptyMessage = 'No results found.',
}: DataTableProps<TData>) {
    const table = useTable(
        {
            features,
            data,
            columns,
            initialState: {
                pagination: { pageIndex: 0, pageSize: 10 },
            },
        },
        (state) => state,
    );

    const {
        pagination: { pageIndex, pageSize },
        globalFilter,
    } = table.state;
    const filteredCount = table.getFilteredRowModel().rows.length;

    return (
        <div className="flex flex-col gap-4">
            <div className="relative w-full sm:max-w-xs">
                <Search
                    className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                />
                <Input
                    value={globalFilter ?? ''}
                    onChange={(e) => table.setGlobalFilter(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="pl-9"
                    aria-label={searchPlaceholder}
                />
            </div>

            <div className="overflow-hidden rounded-xl border">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr
                                key={headerGroup.id}
                                className="border-b bg-muted/50 text-left"
                            >
                                {headerGroup.headers.map((header) => {
                                    const canSort = header.column.getCanSort();
                                    const sorted = header.column.getIsSorted();

                                    return (
                                        <th
                                            key={header.id}
                                            className={`px-4 py-3 font-medium ${header.column.columnDef.meta?.headerClassName ?? ''}`}
                                        >
                                            {canSort ? (
                                                <button
                                                    type="button"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}
                                                    {sorted === 'asc' ? (
                                                        <ArrowUp
                                                            className="h-3.5 w-3.5"
                                                            aria-hidden="true"
                                                        />
                                                    ) : sorted === 'desc' ? (
                                                        <ArrowDown
                                                            className="h-3.5 w-3.5"
                                                            aria-hidden="true"
                                                        />
                                                    ) : (
                                                        <ArrowUpDown
                                                            className="h-3.5 w-3.5 opacity-40"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                </button>
                                            ) : (
                                                flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-12 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b transition-colors last:border-b-0 hover:bg-muted/30"
                                >
                                    {row.getAllCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className={`px-4 py-3 ${cell.column.columnDef.meta?.cellClassName ?? ''}`}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                <p>
                    Showing{' '}
                    <span className="font-medium text-foreground">
                        {filteredCount === 0 ? 0 : pageIndex * pageSize + 1}–
                        {Math.min((pageIndex + 1) * pageSize, filteredCount)}
                    </span>{' '}
                    of <span className="font-medium text-foreground">{filteredCount}</span>{' '}
                    results
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

interface RenderTableProps<T> {
    columns: ColumnDef<T, any>[];
    data: T[];
    pagination?: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
    className?: string;
    emptyMessage?: string;
    loading?: boolean;
    loadingRows?: number;
    globalSearch?: boolean;
    searchPlaceholder?: string;
    extraButtons?: React.ReactNode;
}

const RenderTable = <T,>({
    columns,
    data,
    pagination = true,
    pageSize = 5,
    pageSizeOptions = [5, 10, 20, 30, 40, 50],
    className = '',
    emptyMessage = 'No data found.',
    loading = false,
    loadingRows = 5,
    globalSearch = false,
    searchPlaceholder = 'Search...',
    extraButtons
}: RenderTableProps<T>) => {
    const [globalFilter, setGlobalFilter] = React.useState('');

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
        initialState: pagination ? {
            pagination: {
                pageSize,
            },
        } : undefined,
    });

    // Generate page numbers for pagination
    const generatePageNumbers = () => {
        if (!pagination) return [];

        const currentPage = table.getState().pagination.pageIndex;
        const totalPages = table.getPageCount();
        const pageNumbers = [];

        // Always show first page
        pageNumbers.push(1);

        // Calculate range around current page
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);

        // Add ellipsis after first page if needed
        if (startPage > 2) {
            pageNumbers.push('ellipsis-start');
        }

        // Add pages around current page
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        // Add ellipsis before last page if needed
        if (endPage < totalPages - 1) {
            pageNumbers.push('ellipsis-end');
        }

        // Always show last page if there is more than one page
        if (totalPages > 1) {
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    const displayData = pagination ? table.getRowModel().rows : data;

    // Loading skeleton component
    const renderSkeleton = () => {
        return Array.from({ length: loadingRows }).map((_, rowIndex) => (
            <TableRow key={`skeleton-${rowIndex}`}>
                {columns.map((column, colIndex) => (
                    <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
                        <Skeleton className="h-4 w-full" />
                    </TableCell>
                ))}
            </TableRow>
        ));
    };

    return (
        <div className={className}>
            {/* Global Search Input */}
            {globalSearch && (
                <div className="flex justify-between mb-4">
                    <Input
                        placeholder={searchPlaceholder}
                        value={globalFilter ?? ''}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="max-w-sm"
                    />
                    {extraButtons && (
                        <div className="flex space-x-2">
                            {extraButtons}
                        </div>
                    )}
                </div>
            )}


            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    // Get headerClassName from column meta
                                    const headerClassName = (header.column.columnDef.meta as any)?.headerClassName || 
                                                          (header.column.columnDef as any)?.headerClassName || '';
                                    
                                    return (
                                        <TableHead 
                                            key={header.id} 
                                            className={headerClassName}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            renderSkeleton()
                        ) : displayData.length ? (
                            (pagination ? table.getRowModel().rows : data).map((row, index) => (
                                <TableRow
                                    key={pagination ? (row as any).id : `row-${index}`}
                                    data-state={pagination && (row as any).getIsSelected ? (row as any).getIsSelected() ? "selected" : undefined : undefined}
                                >
                                    {(pagination
                                        ? (row as any).getVisibleCells()
                                        : table.getRowModel().rows[0]?.getVisibleCells() || []
                                    ).map((cell: any, cellIndex: number) => {
                                        // Get className from column meta
                                        const cellClassName = (cell.column.columnDef.meta as any)?.className || 
                                                            (cell.column.columnDef as any)?.className || '';
                                        
                                        return (
                                            <TableCell 
                                                key={pagination ? cell.id : `cell-${index}-${cellIndex}`}
                                                className={cellClassName}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    {globalFilter ? 'No results found for your search.' : emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {pagination && !loading && (
                <div className="flex justify-between items-center py-4">
                    <div>
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            table.previousPage();
                                        }}
                                        className={
                                            !table.getCanPreviousPage()
                                                ? 'pointer-events-none opacity-50'
                                                : undefined
                                        }
                                    />
                                </PaginationItem>

                                {generatePageNumbers().map((page, index) => {
                                    if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                                        return (
                                            <PaginationItem key={`ellipsis-${index}`}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }

                                    const pageNumber = page as number;
                                    const isCurrentPage = table.getState().pagination.pageIndex === pageNumber - 1;

                                    return (
                                        <PaginationItem key={pageNumber}>
                                            <PaginationLink
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    table.setPageIndex(pageNumber - 1);
                                                }}
                                                isActive={isCurrentPage}
                                            >
                                                {pageNumber}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            table.nextPage();
                                        }}
                                        className={
                                            !table.getCanNextPage()
                                                ? 'pointer-events-none opacity-50'
                                                : undefined
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>

                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-nowrap">Rows per page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {pageSizeOptions.map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RenderTable;
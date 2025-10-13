import React, { useState, useMemo } from 'react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

// Define the User type
type User = {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'moderator';
    status: 'active' | 'inactive' | 'pending';
    createdAt: string;
};

const Admin = () => {
    // Sample user data - replace with your actual data source
    const [data, setData] = useState<User[]>([
        {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'admin',
            status: 'active',
            createdAt: '2023-01-15',
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'user',
            status: 'active',
            createdAt: '2023-02-20',
        },
        {
            id: '3',
            name: 'Bob Johnson',
            email: 'bob@example.com',
            role: 'moderator',
            status: 'pending',
            createdAt: '2023-03-10',
        },
        {
            id: '4',
            name: 'Alice Brown',
            email: 'alice@example.com',
            role: 'user',
            status: 'inactive',
            createdAt: '2023-04-05',
        },
        {
            id: '5',
            name: 'Charlie Wilson',
            email: 'charlie@example.com',
            role: 'admin',
            status: 'active',
            createdAt: '2023-05-12',
        },
        {
            id: '6',
            name: 'Diana Lee',
            email: 'diana@example.com',
            role: 'user',
            status: 'active',
            createdAt: '2023-06-18',
        },
        {
            id: '7',
            name: 'Edward Miller',
            email: 'edward@example.com',
            role: 'moderator',
            status: 'pending',
            createdAt: '2023-07-22',
        },
        {
            id: '8',
            name: 'Fiona Davis',
            email: 'fiona@example.com',
            role: 'user',
            status: 'inactive',
            createdAt: '2023-08-30',
        },
        {
            id: '9',
            name: 'George Thompson',
            email: 'george@example.com',
            role: 'admin',
            status: 'active',
            createdAt: '2023-09-05',
        },
        {
            id: '10',
            name: 'Hannah Clark',
            email: 'hannah@example.com',
            role: 'user',
            status: 'active',
            createdAt: '2023-10-15',
        },
        {
            id: '11',
            name: 'Ian Walker',
            email: 'ian@example.com',
            role: 'moderator',
            status: 'pending',
            createdAt: '2023-11-20',
        },
        {
            id: '12',
            name: 'Jessica Hall',
            email: 'jessica@example.com',
            role: 'user',
            status: 'inactive',
            createdAt: '2023-12-25',
        },
    ]);

    const columnHelper = createColumnHelper<User>();

    const columns = useMemo(
        () => [
            columnHelper.accessor('id', {
                header: 'ID',
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor('name', {
                header: 'Name',
                cell: (info) => <span className="font-medium">{info.getValue()}</span>,
            }),
            columnHelper.accessor('email', {
                header: 'Email',
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor('role', {
                header: 'Role',
                cell: (info) => (
                    <Badge
                        variant={
                            info.getValue() === 'admin'
                                ? 'destructive'
                                : info.getValue() === 'moderator'
                                    ? 'secondary'
                                    : 'default'
                        }
                    >
                        {info.getValue()}
                    </Badge>
                ),
            }),
            columnHelper.accessor('status', {
                header: 'Status',
                cell: (info) => (
                    <Badge
                        variant={
                            info.getValue() === 'active'
                                ? 'default'
                                : info.getValue() === 'pending'
                                    ? 'outline'
                                    : 'secondary'
                        }
                    >
                        {info.getValue()}
                    </Badge>
                ),
            }),
            columnHelper.accessor('createdAt', {
                header: 'Created At',
                cell: (info) => new Date(info.getValue()).toLocaleDateString(),
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(row.original)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(row.original.id)}
                        >
                            Delete
                        </Button>
                    </div>
                ),
            }),
        ],
        [columnHelper]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 5,
            },
        },
    });

    const handleEdit = (user: User) => {
        console.log('Edit user:', user);
        // Implement edit functionality
    };

    const handleDelete = (userId: string) => {
        console.log('Delete user:', userId);
        // Implement delete functionality
        setData(data.filter(user => user.id !== userId));
    };

    // Generate page numbers for pagination
    const generatePageNumbers = () => {
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

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Welcome to Admin Panel</h1>
                <p className="text-gray-600">Manage your users from here</p>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
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
                            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};

export default Admin;
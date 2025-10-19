import React, { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { PencilLine, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import RenderTable from '@/components/RenderTable';
import GenericTooltip from '@/components/GenericTooltip';
import userService from '@/services/user.service';
import { toast } from 'sonner';
import ConfirmationBox from '@/components/ConfirmationBox';
import { format, startOfMonth, isAfter } from 'date-fns';
import config from '@/config/config';
import { useNavigate } from 'react-router-dom';

// Define the User type
type User = {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'end_user' | 'content_creator';
    status: 'active' | 'inactive' | 'pending';
    createdAt: string;
};

const ManageUser = () => {
    const queryClient = useQueryClient();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [userToDelete, setUserToDelete] = React.useState<string | null>(null);
    const [userName, setUserName] = React.useState<string>('');
    const navigate = useNavigate();

    // Fetch users with React Query
    const {
        data: users = [],
        isLoading,
    } = useQuery({
        queryKey: ['users'],
        queryFn: () => userService.getUsers(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Calculate KPIs from user data
    const kpis = useMemo(() => {
        const totalUsers = users.length;
        const regularUsers = users.filter((user: { role: string; }) => user.role === 'end_user').length;
        const adminUsers = users.filter((user: { role: string; }) => user.role === 'admin').length;
        const moderatorUsers = users.filter((user: { role: string; }) => user.role === 'moderator').length;

        // Calculate new users this month
        const currentMonthStart = startOfMonth(new Date());
        const newThisMonth = users.filter((user: { createdAt: string | number | Date; }) =>
            isAfter(new Date(user.createdAt), currentMonthStart)
        ).length;

        // Calculate user status distribution
        const activeUsers = users.filter((user: { status: string; }) => user.status === 'active').length;
        const inactiveUsers = users.filter((user: { status: string; }) => user.status === 'inactive').length;
        const pendingUsers = users.filter((user: { status: string; }) => user.status === 'pending').length;

        return {
            totalUsers,
            regularUsers,
            adminUsers,
            moderatorUsers,
            newThisMonth,
            activeUsers,
            inactiveUsers,
            pendingUsers,
        };
    }, [users]);

    // Delete user mutation
    const deleteMutation = useMutation({
        mutationFn: (userId: string) => userService.deleteUserById(userId),
        onSuccess: () => {
            toast.success("User deleted successfully");
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.log(error);
            toast.error("Failed to delete user");
        },
        onSettled: () => {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
            setUserName('');
        },
    });

    const columnHelper = createColumnHelper<User>();

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Name',
                cell: (info) => <span className="font-medium">{info.getValue()}</span>,
                meta: {
                    headerClassName: 'text-left pl-4',
                    className: 'text-left font-semibold pl-4',
                },
            }),
            columnHelper.accessor('email', {
                header: 'Email',
                cell: (info) => info.getValue(),
                meta: {
                    headerClassName: 'text-left',
                },
            }),
            columnHelper.accessor('role', {
                header: 'Role',
                cell: (info) => info.getValue(),
                meta: {
                    headerClassName: 'text-center',
                    className: 'text-center uppercase',
                },
            }),
            columnHelper.accessor('createdAt', {
                header: 'Created At',
                cell: (info) => {
                    const value = info.getValue();
                    return value ? format(new Date(value), config.DATE_FORMAT) : 'N/A';
                },
                meta: {
                    headerClassName: 'text-right',
                    className: 'text-right text-gray-500',
                },
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                meta: {
                    headerClassName: 'text-center',
                    className: 'text-center ',
                },
                cell: ({ row }) => (
                    <div className="flex gap-1 space-x-2 justify-center">
                        <GenericTooltip content="Edit User">
                            <PencilLine
                                size={20}
                                strokeWidth={1}
                                cursor="pointer"
                                onClick={() => navigate(`/admin/users/${row.original._id}`, { state: { mode: 'edit' } })}
                            />
                        </GenericTooltip>
                        <GenericTooltip content="Delete item" >
                            <Trash2
                                size={20}
                                color="red"
                                strokeWidth={1}
                                cursor="pointer"
                                onClick={() => openDeleteDialog(row.original._id, row.original.name)}
                            />
                        </GenericTooltip>
                    </div>
                ),
            }),
        ],
        [columnHelper]
    );

    const openDeleteDialog = (userId: string, userName: string) => {
        setUserToDelete(userId);
        setUserName(userName);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        deleteMutation.mutate(userToDelete);
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        setUserName('');
        toast.info("Deletion cancelled");
    };

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-gray-600">Manage your users from here</p>
            </div>

            {/* KPI Cards Section */}
            <div className="flex flex-wrap gap-4 mb-6">
                {/* Total Users */}
                <div className="border rounded-md p-4 w-full sm:w-[48%] lg:w-[23%] flex flex-col justify-between gap-2 text-card-foreground shadow-sm">
                    <span className="text-sm font-medium text-muted-foreground">Total Users</span>
                    <span className="text-2xl font-semibold">{kpis.totalUsers}</span>
                    <span className="text-xs text-gray-500">All registered users</span>
                </div>

                {/* Regular Users */}
                <div className="border rounded-md p-4 w-full sm:w-[48%] lg:w-[23%] flex flex-col justify-between gap-2 text-card-foreground shadow-sm">
                    <span className="text-sm font-medium text-muted-foreground">Regular Users</span>
                    <span className="text-2xl font-semibold">{kpis.regularUsers}</span>
                    <span className="text-xs text-gray-500">Standard user accounts</span>
                </div>

                {/* Admin Users */}
                <div className="border rounded-md p-4 w-full sm:w-[48%] lg:w-[23%] flex flex-col justify-between gap-2 text-card-foreground shadow-sm ">
                    <span className="text-sm font-medium text-muted-foreground">Admin Users</span>
                    <span className="text-2xl font-semibold">{kpis.adminUsers}</span>
                    <span className="text-xs text-gray-500">Administrator accounts</span>
                </div>

                {/* New This Month */}
                <div className="border rounded-md p-4 w-full sm:w-[48%] lg:w-[23%] flex flex-col justify-between gap-2 text-card-foreground shadow-sm ">
                    <span className="text-sm font-medium text-muted-foreground">New This Month</span>
                    <span className="text-2xl font-semibold">{kpis.newThisMonth}</span>
                    <span className="text-xs text-gray-500">Recent signups</span>
                </div>

            </div>

            <RenderTable
                columns={columns}
                data={users}
                pagination={true}
                pageSize={10}
                loading={isLoading}
                emptyMessage="No users found."
                globalSearch
            />

            <ConfirmationBox
                isOpen={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                onCancel={handleCancelDelete}
                title="Delete User"
                description={`Are you sure you want to delete "${userName}"? This action cannot be undone and will permanently delete the user account and all associated data.`}
                confirmText="Delete User"
                cancelText="Cancel"
                confirmButtonVariant="destructive"
                cancelButtonVariant="outline"
                loading={deleteMutation.isPending}
                loadingText="Deleting..."
            />
        </>
    );
};

export default ManageUser;
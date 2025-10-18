import React, { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import RenderTable from '@/components/RenderTable';
import GenericTooltip from '@/components/GenericTooltip';
import userService from '@/services/user.service';
import { toast } from 'sonner';
import ConfirmationBox from '@/components/ConfirmationBox';
import { format } from 'date-fns';
import config from '@/config/config';

// Define the User type
type User = {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'moderator';
    status: 'active' | 'inactive' | 'pending';
    createdAt: string;
};

const ManageUser = () => {
    const queryClient = useQueryClient();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [userToDelete, setUserToDelete] = React.useState<string | null>(null);
    const [userName, setUserName] = React.useState<string>('');

    // Fetch users with React Query
    const {
        data: users = [],
        isLoading,
    } = useQuery({
        queryKey: ['users'],
        queryFn: () => userService.getUsers(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

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
                    headerClassName: 'text-center w-20',
                    className: 'text-center w-20',
                },
                cell: ({ row }) => (
                    <div className="flex space-x-2 justify-center">
                        <GenericTooltip content="Delete item" side="right">
                            <Trash2
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
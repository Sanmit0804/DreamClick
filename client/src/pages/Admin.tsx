import React, { useState, useMemo, useEffect } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import RenderTable from '@/components/RenderTable';
import GenericTooltip from '@/components/GenericTooltip';
import userService from '@/services/user.service';
import { toast } from 'sonner';
import ConfirmationBox from '@/components/ConfirmationBox';

// Define the User type
type User = {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'moderator';
    status: 'active' | 'inactive' | 'pending';
    createdAt: string;
};

const Admin = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [userName, setUserName] = useState<string>('');

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await userService.getUsers();
            setData(response);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, [])

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
                cell: (info) => new Date(info.getValue()).toLocaleDateString(),
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
                        <GenericTooltip
                            content="Delete item"
                            side='right'
                        >
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

        try {
            setDeleteLoading(true);
            await userService.deleteUserById(userToDelete);
            toast.success("User deleted successfully");
            fetchUsers();
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete user");
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
            setUserToDelete(null);
            setUserName('');
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        setUserName('');
        toast.info("Deletion cancelled");
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Welcome to Admin Panel</h1>
                <p className="text-gray-600">Manage your users from here</p>
            </div>

            <RenderTable
                columns={columns}
                data={data}
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
                loading={deleteLoading}
                loadingText="Deleting..."
            />
        </div>
    );
};

export default Admin;
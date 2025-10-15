import React, { useState, useMemo, useEffect } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import RenderTable from '@/components/RenderTable';
import GenericTooltip from '@/components/GenericTooltip';
import userService from '@/services/user.service';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
                    className: 'text-center',
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
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
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
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            account and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel 
                            onClick={handleCancelDelete}
                            disabled={deleteLoading}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteLoading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleteLoading ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Admin;
import { Form, Head, Link } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/data-table';
import type { DataTableColumnDef } from '@/components/data-table';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { dashboard } from '@/routes';
import { destroy, edit, index as usersIndex, store } from '@/routes/users';

type UserItem = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    roles: string[];
    created_at: string;
};

type Props = {
    users: UserItem[];
    roles: string[];
};

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function CreateUserDialog({ roles }: { roles: string[] }) {
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState('');

    const handleSuccess = (): void => {
        setRole('');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button data-test="create-user-button">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    New user
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>New user</DialogTitle>
                    <DialogDescription>
                        Create a user account and choose their access role.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...store.form()}
                    resetOnSuccess
                    onSuccess={handleSuccess}
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="create-name">Name</Label>
                                <Input
                                    id="create-name"
                                    name="name"
                                    required
                                    autoFocus
                                    placeholder="e.g. Jane Doe"
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-email">Email</Label>
                                <Input
                                    id="create-email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="jane@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-phone">Phone</Label>
                                <Input
                                    id="create-phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="e.g. +255 712 345 678"
                                />
                                <InputError message={errors.phone} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-role">Role</Label>
                                <input type="hidden" name="role" value={role} />
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger
                                        id="create-role"
                                        className="w-full"
                                        aria-invalid={Boolean(errors.role)}
                                    >
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((availableRole) => (
                                            <SelectItem
                                                key={availableRole}
                                                value={availableRole}
                                            >
                                                {availableRole}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="create-password">
                                        Password
                                    </Label>
                                    <Input
                                        id="create-password"
                                        name="password"
                                        type="password"
                                        required
                                        autoComplete="new-password"
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-password-confirm">
                                        Confirm password
                                    </Label>
                                    <Input
                                        id="create-password-confirm"
                                        name="password_confirmation"
                                        type="password"
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Create
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteUserDialog({ user }: { user: UserItem }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${user.name}`}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete user</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-foreground">
                            {user.name}
                        </span>
                        ? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...destroy.form(user.id)}
                    onSuccess={() => setOpen(false)}
                >
                    {({ processing }) => (
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Delete
                            </Button>
                        </DialogFooter>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

const columns: DataTableColumnDef<UserItem>[] = [
    {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => (
            <div className="font-medium">{row.original.name}</div>
        ),
    },
    {
        id: 'email',
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }) => (
            <span className="text-muted-foreground">{row.original.email}</span>
        ),
    },
    {
        id: 'phone',
        header: 'Phone',
        accessorFn: (user) => user.phone ?? '',
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.original.phone ?? '—'}
            </span>
        ),
    },
    {
        id: 'roles',
        header: 'Role',
        accessorFn: (user) => user.roles.join(' '),
        cell: ({ row }) =>
            row.original.roles.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                    {row.original.roles.map((role) => (
                        <Badge
                            key={role}
                            variant="secondary"
                            className="border border-primary/15 bg-primary/8 text-primary"
                        >
                            {role}
                        </Badge>
                    ))}
                </div>
            ) : (
                <span className="text-sm text-muted-foreground">No role</span>
            ),
    },
    {
        id: 'created_at',
        header: 'Joined',
        accessorKey: 'created_at',
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {formatDate(row.original.created_at)}
            </span>
        ),
    },
    {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableGlobalFilter: false,
        meta: {
            headerClassName: 'text-right',
            cellClassName: 'text-right',
        },
        cell: ({ row }) => (
            <div className="flex justify-end gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${row.original.name}`}
                    asChild
                >
                    <Link href={edit(row.original.id)} prefetch>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </Button>
                <DeleteUserDialog user={row.original} />
            </div>
        ),
    },
];

export default function UsersIndex({ users, roles }: Props) {
    return (
        <>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Users
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create and manage user accounts and permissions.
                        </p>
                    </div>
                    <CreateUserDialog roles={roles} />
                </div>

                {users.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Users
                                className="h-6 w-6 text-primary"
                                aria-hidden="true"
                            />
                        </span>
                        <p className="font-medium">No users yet</p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            Create your first user and it will appear here.
                        </p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={users}
                        searchPlaceholder="Search users..."
                        emptyMessage="No users match your search."
                    />
                )}
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Users',
            href: usersIndex(),
        },
    ],
};

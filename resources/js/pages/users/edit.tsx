import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';
import { index as usersIndex } from '@/routes/users';
import { update } from '@/routes/users';
import { sync } from '@/routes/users/permissions';

type UserInfo = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string | null;
};

type Props = {
    user: UserInfo;
    roles: string[];
    can_manage_permissions: boolean;
    userPermissions: string[];
    permissions: string[];
};

export default function EditUser({
    user,
    roles,
    can_manage_permissions,
    userPermissions,
    permissions,
}: Props) {
    const [role, setRole] = useState(user.role ?? '');

    return (
        <>
            <Head title={`Edit — ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            {user.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Update account details and assign permissions.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={usersIndex()} prefetch>
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Back to users
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border p-6">
                        <h2 className="mb-4 font-medium">Account details</h2>
                        <Form
                            {...update.form(user.id)}
                            className="flex flex-col gap-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-name">Name</Label>
                                        <Input
                                            id="edit-name"
                                            name="name"
                                            required
                                            defaultValue={user.name}
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-email">
                                            Email
                                        </Label>
                                        <Input
                                            id="edit-email"
                                            name="email"
                                            type="email"
                                            required
                                            defaultValue={user.email}
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-phone">
                                            Phone
                                        </Label>
                                        <Input
                                            id="edit-phone"
                                            name="phone"
                                            type="tel"
                                            defaultValue={user.phone ?? ''}
                                            placeholder="e.g. +255 712 345 678"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-role">Role</Label>
                                        <input
                                            type="hidden"
                                            name="role"
                                            value={role}
                                        />
                                        <Select
                                            value={role}
                                            onValueChange={setRole}
                                        >
                                            <SelectTrigger
                                                id="edit-role"
                                                className="w-full"
                                                aria-invalid={Boolean(
                                                    errors.role,
                                                )}
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
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing && <Spinner />}
                                            Save changes
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>

                    {can_manage_permissions && (
                        <div className="rounded-xl border p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <ShieldCheck
                                    className="h-5 w-5 text-primary"
                                    aria-hidden="true"
                                />
                                <h2 className="font-medium">Permissions</h2>
                            </div>
                            {permissions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No permissions defined yet. Run the
                                    permission seeder to populate them.
                                </p>
                            ) : (
                                <Form
                                    {...sync.form(user.id)}
                                    className="flex flex-col gap-4"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {permissions.map(
                                                    (permission) => (
                                                        <div
                                                            key={permission}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Checkbox
                                                                id={`permission-${permission}`}
                                                                name="permissions[]"
                                                                value={
                                                                    permission
                                                                }
                                                                defaultChecked={userPermissions.includes(
                                                                    permission,
                                                                )}
                                                            />
                                                            <Label
                                                                htmlFor={`permission-${permission}`}
                                                                className="cursor-pointer font-normal capitalize"
                                                            >
                                                                {permission}
                                                            </Label>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                            <InputError
                                                message={errors.permissions}
                                            />
                                            <div className="flex justify-end">
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    {processing && <Spinner />}
                                                    Save permissions
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

EditUser.layout = {
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

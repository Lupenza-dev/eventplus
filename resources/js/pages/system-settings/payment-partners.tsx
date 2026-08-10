import { Form, Head } from '@inertiajs/react';
import { CreditCard, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Spinner } from '@/components/ui/spinner';
import { systemSettings } from '@/routes';
import {
    destroy,
    index as partnersIndex,
    store,
    update,
} from '@/routes/payment-partners';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

type Partner = {
    id: number;
    name: string;
    is_active: boolean;
    image: string | null;
    image_url: string | null;
    created_at: string;
};

type Props = {
    partners: Partner[];
};

function PartnerFormFields({
    partner,
    errors,
}: {
    partner?: Partner;
    errors: Partial<Record<string, string>>;
}) {
    const [isActive, setIsActive] = useState<boolean>(partner?.is_active ?? true);
    const [imagePreview, setImagePreview] = useState<string | null>(
        partner?.image_url ?? null,
    );
    const [imageError, setImageError] = useState<string | null>(null);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (!file) {
            setImagePreview(partner?.image_url ?? null);
            setImageError(null);
            return;
        }

        if (file.size > MAX_IMAGE_BYTES) {
            e.target.value = '';
            setImagePreview(partner?.image_url ?? null);
            setImageError('Image must be 2 MB or smaller.');
            return;
        }

        setImageError(null);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    }

    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor={partner ? `edit-name-${partner.id}` : 'create-name'}>
                    Name
                </Label>
                <Input
                    id={partner ? `edit-name-${partner.id}` : 'create-name'}
                    name="name"
                    required
                    autoFocus
                    defaultValue={partner?.name}
                    placeholder="e.g. Vodacom M-Pesa"
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={partner ? `edit-image-${partner.id}` : 'create-image'}>
                    Logo
                </Label>
                {imagePreview && (
                    <img
                        src={imagePreview}
                        alt="Logo preview"
                        className="h-16 w-16 rounded-lg border object-cover"
                    />
                )}
                <Input
                    id={partner ? `edit-image-${partner.id}` : 'create-image'}
                    name="image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleImageChange}
                />
                <InputError message={imageError ?? errors.image} />
            </div>

            <div className="flex items-center gap-2">
                <input type="hidden" name="is_active" value={isActive ? '1' : '0'} />
                <Checkbox
                    id={partner ? `edit-active-${partner.id}` : 'create-active'}
                    checked={isActive}
                    onCheckedChange={(checked) => setIsActive(checked === true)}
                />
                <Label
                    htmlFor={partner ? `edit-active-${partner.id}` : 'create-active'}
                    className="cursor-pointer font-normal"
                >
                    Active
                </Label>
            </div>
        </>
    );
}

function CreatePartnerDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button data-test="create-partner-button">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    New payment partner
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Payment partner</DialogTitle>
                    <DialogDescription>
                        Add a payment provider attendees can use to pay for tickets.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...store.form()}
                    resetOnSuccess
                    onSuccess={() => setOpen(false)}
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <PartnerFormFields errors={errors} />
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

function EditPartnerDialog({ partner }: { partner: Partner }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Edit ${partner.name}`}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit payment partner</DialogTitle>
                    <DialogDescription>
                        Update the details of this payment partner.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...update.form(partner.id)}
                    onSuccess={() => setOpen(false)}
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <PartnerFormFields partner={partner} errors={errors} />
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
                                    Save changes
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function DeletePartnerDialog({ partner }: { partner: Partner }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${partner.name}`}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete payment partner</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-foreground">
                            {partner.name}
                        </span>
                        ?
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...destroy.form(partner.id)}
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

export default function PaymentPartners({ partners }: Props) {
    return (
        <>
            <Head title="Payment Partners" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Payment Partners
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage the payment providers attendees can use to buy
                            tickets.
                        </p>
                    </div>
                    <CreatePartnerDialog />
                </div>

                {partners.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <CreditCard className="h-6 w-6 text-primary" aria-hidden="true" />
                        </span>
                        <p className="font-medium">No payment partners yet</p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            Add your first payment partner and it will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50 text-left">
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                        Status
                                    </th>
                                    <th className="hidden px-4 py-3 font-medium md:table-cell">
                                        Created
                                    </th>
                                    <th className="w-24 px-4 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {partners.map((partner) => (
                                    <tr
                                        key={partner.id}
                                        className="border-b transition-colors last:border-b-0 hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {partner.image_url ? (
                                                    <img
                                                        src={partner.image_url}
                                                        alt={partner.name}
                                                        className="h-8 w-8 shrink-0 rounded-md border object-cover"
                                                    />
                                                ) : (
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                                        <CreditCard
                                                            className="h-4 w-4 text-primary"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                )}
                                                <span className="font-medium">
                                                    {partner.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="hidden px-4 py-3 sm:table-cell">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    partner.is_active
                                                        ? 'bg-[#00B894]/10 text-[#00B894]'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {partner.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                            {new Date(partner.created_at).toLocaleDateString(
                                                undefined,
                                                {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                },
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <EditPartnerDialog partner={partner} />
                                                <DeletePartnerDialog partner={partner} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

PaymentPartners.layout = {
    breadcrumbs: [
        {
            title: 'System Settings',
            href: systemSettings(),
        },
        {
            title: 'Payment Partners',
            href: partnersIndex(),
        },
    ],
};

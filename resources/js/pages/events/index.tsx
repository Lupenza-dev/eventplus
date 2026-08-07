import { Form, Head, Link } from '@inertiajs/react';
import { CalendarDays, Pencil, Plus, Ticket, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { DataTable } from '@/components/data-table';
import type { DataTableColumnDef } from '@/components/data-table';
import { dashboard } from '@/routes';
import { destroy, index as eventsIndex, store, update } from '@/routes/events';
import { index as ticketsIndex } from '@/routes/events/tickets';

type Category = {
    id: number;
    name: string;
};

type EventItem = {
    id: number;
    event_category_id: number;
    title: string;
    location: string | null;
    event_date: string | null;
    start_date: string | null;
    end_date: string | null;
    description: string | null;
    is_active: boolean;
    is_approved: number;
    is_paid_event: boolean;
    image: string | null;
    image_url: string | null;
    category: Category | null;
};

type Props = {
    events: EventItem[];
    categories: Category[];
};

const MAX_IMAGE_BYTES = 1.9 * 1024 * 1024;

const approvalLabels: Record<number, { label: string; className: string }> = {
    0: { label: 'Pending', className: 'bg-[#FDCB6E]/15 text-[#B8860B]' },
    1: { label: 'Approved', className: 'bg-[#00B894]/15 text-[#00B894]' },
    2: { label: 'Rejected', className: 'bg-[#FF6B6B]/15 text-[#FF6B6B]' },
};

function toInputDateTime(value: string | null): string {
    if (!value) {
        return '';
    }

    return value.slice(0, 16);
}

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function EventFormFields({
    categories,
    event,
    errors,
}: {
    categories: Category[];
    event?: EventItem;
    errors: Partial<Record<string, string>>;
}) {
    const [categoryId, setCategoryId] = useState<string>(
        event ? String(event.event_category_id) : '',
    );
    const [isPaid, setIsPaid] = useState<boolean>(event?.is_paid_event ?? false);
    const [isOneDay, setIsOneDay] = useState<boolean>(
        event ? event.event_date !== null : true,
    );
    const [imagePreview, setImagePreview] = useState<string | null>(
        event?.image_url ?? null,
    );
    const [imageError, setImageError] = useState<string | null>(null);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (!file) {
            setImagePreview(event?.image_url ?? null);
            setImageError(null);
            return;
        }

        if (file.size > MAX_IMAGE_BYTES) {
            e.target.value = '';
            setImagePreview(event?.image_url ?? null);
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
                <Label htmlFor={event ? `edit-title-${event.id}` : 'create-title'}>
                    Title
                </Label>
                <Input
                    id={event ? `edit-title-${event.id}` : 'create-title'}
                    name="title"
                    required
                    autoFocus
                    defaultValue={event?.title}
                    placeholder="e.g. Dar Music Festival"
                />
                <InputError message={errors.title} />
            </div>

            <div className="grid gap-2">
                <Label>Category</Label>
                <input type="hidden" name="event_category_id" value={categoryId} />
                <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.event_category_id} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={event ? `edit-location-${event.id}` : 'create-location'}>
                    Location
                </Label>
                <Input
                    id={event ? `edit-location-${event.id}` : 'create-location'}
                    name="location"
                    defaultValue={event?.location ?? ''}
                    placeholder="e.g. Uhuru Stadium, Dar es Salaam"
                />
                <InputError message={errors.location} />
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    id={event ? `edit-oneday-${event.id}` : 'create-oneday'}
                    checked={isOneDay}
                    onCheckedChange={(checked) => setIsOneDay(checked === true)}
                />
                <Label
                    htmlFor={event ? `edit-oneday-${event.id}` : 'create-oneday'}
                    className="cursor-pointer font-normal"
                >
                    One-day event
                </Label>
            </div>

            {isOneDay ? (
                <div className="grid gap-2">
                    <Label
                        htmlFor={event ? `edit-eventdate-${event.id}` : 'create-eventdate'}
                    >
                        Event date
                    </Label>
                    <Input
                        id={event ? `edit-eventdate-${event.id}` : 'create-eventdate'}
                        name="event_date"
                        type="datetime-local"
                        required
                        defaultValue={toInputDateTime(event?.event_date ?? null)}
                    />
                    <InputError message={errors.event_date} />
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor={event ? `edit-start-${event.id}` : 'create-start'}>
                            Start date
                        </Label>
                        <Input
                            id={event ? `edit-start-${event.id}` : 'create-start'}
                            name="start_date"
                            type="datetime-local"
                            required
                            defaultValue={toInputDateTime(event?.start_date ?? null)}
                        />
                        <InputError message={errors.start_date} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={event ? `edit-end-${event.id}` : 'create-end'}>
                            End date
                        </Label>
                        <Input
                            id={event ? `edit-end-${event.id}` : 'create-end'}
                            name="end_date"
                            type="datetime-local"
                            required
                            defaultValue={toInputDateTime(event?.end_date ?? null)}
                        />
                        <InputError message={errors.end_date} />
                    </div>
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor={event ? `edit-desc-${event.id}` : 'create-desc'}>
                    Description
                </Label>
                <textarea
                    id={event ? `edit-desc-${event.id}` : 'create-desc'}
                    name="description"
                    rows={4}
                    defaultValue={event?.description ?? ''}
                    placeholder="Brief description of the event"
                    className="border-input bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex min-h-16 w-full rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
                <InputError message={errors.description} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={event ? `edit-image-${event.id}` : 'create-image'}>
                    Event image
                </Label>
                {imagePreview && (
                    <img
                        src={imagePreview}
                        alt="Event preview"
                        className="h-32 w-full rounded-lg border object-cover"
                    />
                )}
                <Input
                    id={event ? `edit-image-${event.id}` : 'create-image'}
                    name="image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                />
                <p className="text-xs text-muted-foreground">
                    JPG, PNG or WebP. Max 2 MB.
                </p>
                <InputError message={imageError ?? errors.image} />
            </div>

            <div className="flex items-center gap-2">
                <input type="hidden" name="is_paid_event" value={isPaid ? '1' : '0'} />
                <Checkbox
                    id={event ? `edit-paid-${event.id}` : 'create-paid'}
                    checked={isPaid}
                    onCheckedChange={(checked) => setIsPaid(checked === true)}
                />
                <Label
                    htmlFor={event ? `edit-paid-${event.id}` : 'create-paid'}
                    className="cursor-pointer font-normal"
                >
                    This is a paid event
                </Label>
            </div>
        </>
    );
}

function CreateEventDialog({ categories }: { categories: Category[] }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button data-test="create-event-button">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    New event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>New event</DialogTitle>
                    <DialogDescription>
                        Fill in the details to publish a new event.
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
                            <EventFormFields categories={categories} errors={errors} />
                            {Object.keys(errors).length > 0 && (
                                <p className="text-sm text-destructive">
                                    Please fix the highlighted fields.
                                </p>
                            )}
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

function EditEventDialog({
    event,
    categories,
}: {
    event: EventItem;
    categories: Category[];
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Edit ${event.title}`}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit event</DialogTitle>
                    <DialogDescription>
                        Update the details of this event.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...update.form(event.id)}
                    onSuccess={() => setOpen(false)}
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <EventFormFields categories={categories} event={event} errors={errors} />
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

function DeleteEventDialog({ event }: { event: EventItem }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${event.title}`}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete event</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-foreground">
                            {event.title}
                        </span>
                        ? This action can be undone by an administrator.
                    </DialogDescription>
                </DialogHeader>
                <Form {...destroy.form(event.id)} onSuccess={() => setOpen(false)}>
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

function buildColumns(categories: Category[]): DataTableColumnDef<EventItem>[] {
    return [
        {
            id: 'title',
            header: 'Title',
            accessorKey: 'title',
            cell: ({ row }) => {
                const event = row.original;

                return (
                    <div>
                        <div className="flex items-center gap-3">
                            {event.image_url ? (
                                <img
                                    src={event.image_url}
                                    alt={event.title}
                                    className="h-10 w-10 shrink-0 rounded-lg border object-cover"
                                />
                            ) : (
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <CalendarDays
                                        className="h-5 w-5 text-primary"
                                        aria-hidden="true"
                                    />
                                </span>
                            )}
                            <div className="font-medium">{event.title}</div>
                        </div>
                        {event.is_paid_event && (
                            <span className="text-xs text-muted-foreground">
                                Paid event
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'category',
            header: 'Category',
            accessorFn: (event) => event.category?.name ?? '',
            cell: ({ row }) => (
                <Badge variant="secondary">
                    {row.original.category?.name ?? '—'}
                </Badge>
            ),
        },
        {
            id: 'date',
            header: 'Date',
            accessorFn: (event) => event.event_date ?? event.start_date ?? '',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {formatDate(
                        row.original.event_date ?? row.original.start_date,
                    )}
                </span>
            ),
        },
        {
            id: 'location',
            header: 'Location',
            accessorFn: (event) => event.location ?? '',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.location ?? '—'}
                </span>
            ),
        },
        {
            id: 'status',
            header: 'Status',
            accessorFn: (event) => approvalLabels[event.is_approved]?.label ?? 'Pending',
            cell: ({ row }) => {
                const approval =
                    approvalLabels[row.original.is_approved] ?? approvalLabels[0];

                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${approval.className}`}
                    >
                        {approval.label}
                    </span>
                );
            },
        },
        {
            id: 'tickets',
            header: 'Tickets',
            enableSorting: false,
            enableGlobalFilter: false,
            cell: ({ row }) => (
                <Button variant="outline" size="sm" asChild>
                    <Link href={ticketsIndex(row.original.id)} prefetch>
                        <Ticket className="h-4 w-4" aria-hidden="true" />
                        Tickets
                    </Link>
                </Button>
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
                    <EditEventDialog event={row.original} categories={categories} />
                    <DeleteEventDialog event={row.original} />
                </div>
            ),
        },
    ];
}

export default function EventsIndex({ events, categories }: Props) {
    const columns = buildColumns(categories);
    return (
        <>
            <Head title="Events" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Events</h1>
                        <p className="text-sm text-muted-foreground">
                            Create and manage your events.
                        </p>
                    </div>
                    <CreateEventDialog categories={categories} />
                </div>

                {events.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <CalendarDays
                                className="h-6 w-6 text-primary"
                                aria-hidden="true"
                            />
                        </span>
                        <p className="font-medium">No events yet</p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            Create your first event and it will appear here.
                        </p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={events}
                        searchPlaceholder="Search events..."
                        emptyMessage="No events match your search."
                    />
                )}
            </div>
        </>
    );
}

EventsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Events',
            href: eventsIndex(),
        },
    ],
};

import { Form, Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    Image,
    MapPin,
    Pencil,
    Plus,
    Ticket,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
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
import { Spinner } from '@/components/ui/spinner';
import { index as eventsIndex } from '@/routes/events';
import { create, destroy, update } from '@/routes/events/tickets';

type EventInfo = {
    id: number;
    title: string;
    description: string | null;
    location: string | null;
    event_date: string | null;
    start_date: string | null;
    end_date: string | null;
    is_paid_event: boolean;
    image_url: string | null;
    category: string | null;
};

type TicketItem = {
    id: number;
    name: string;
    price: string;
    quantity: number;
    description: string | null;
    design_image_url: string | null;
    qr_code_x: string;
    qr_code_y: string;
    qr_code_width: string;
    qr_code_height: string;
    created_at: string;
};

type Props = {
    event: EventInfo;
    tickets: TicketItem[];
};

function formatPrice(price: string): string {
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'TZS',
        maximumFractionDigits: 0,
    }).format(Number(price));
}

function formatEventDate(value: string): string {
    return new Date(value).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function EventDetailsHeader({ event }: { event: EventInfo }) {
    return (
        <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex flex-col sm:flex-row">
                {event.image_url ? (
                    <img
                        src={event.image_url}
                        alt={event.title}
                        className="h-44 w-full object-cover sm:h-auto sm:w-52 sm:shrink-0"
                    />
                ) : (
                    <div className="flex h-44 w-full items-center justify-center bg-linear-to-br from-[#6C5CE7] to-[#8E7CF8] sm:h-auto sm:w-52 sm:shrink-0">
                        <Ticket
                            className="h-12 w-12 text-white/80"
                            aria-hidden="true"
                        />
                    </div>
                )}
                <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                        {event.category && (
                            <Badge variant="secondary">{event.category}</Badge>
                        )}
                        <Badge
                            variant={
                                event.is_paid_event ? 'default' : 'outline'
                            }
                        >
                            {event.is_paid_event ? 'Paid event' : 'Free event'}
                        </Badge>
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight">
                        {event.title}
                    </h2>
                    {event.description && (
                        <p className="text-sm text-muted-foreground">
                            {event.description}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        {event.event_date && (
                            <span className="flex items-center gap-2">
                                <CalendarDays
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                {formatEventDate(event.event_date)}
                            </span>
                        )}
                        {event.location && (
                            <span className="flex items-center gap-2">
                                <MapPin
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                {event.location}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TicketFormFields({
    ticket,
    errors,
}: {
    ticket?: TicketItem;
    errors: Partial<Record<string, string>>;
}) {
    return (
        <>
            {ticket && (
                <>
                    <input
                        type="hidden"
                        name="qr_code_x"
                        value={ticket.qr_code_x}
                    />
                    <input
                        type="hidden"
                        name="qr_code_y"
                        value={ticket.qr_code_y}
                    />
                    <input
                        type="hidden"
                        name="qr_code_width"
                        value={ticket.qr_code_width}
                    />
                    <input
                        type="hidden"
                        name="qr_code_height"
                        value={ticket.qr_code_height}
                    />
                </>
            )}
            <div className="grid gap-2">
                <Label
                    htmlFor={ticket ? `edit-name-${ticket.id}` : 'create-name'}
                >
                    Ticket name
                </Label>
                <Input
                    id={ticket ? `edit-name-${ticket.id}` : 'create-name'}
                    name="name"
                    required
                    autoFocus
                    defaultValue={ticket?.name}
                    placeholder="e.g. VIP, Early Bird, Regular"
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label
                        htmlFor={
                            ticket ? `edit-price-${ticket.id}` : 'create-price'
                        }
                    >
                        Price (TZS)
                    </Label>
                    <Input
                        id={ticket ? `edit-price-${ticket.id}` : 'create-price'}
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        defaultValue={ticket?.price}
                        placeholder="e.g. 25000"
                    />
                    <InputError message={errors.price} />
                </div>
                <div className="grid gap-2">
                    <Label
                        htmlFor={
                            ticket
                                ? `edit-quantity-${ticket.id}`
                                : 'create-quantity'
                        }
                    >
                        Quantity
                    </Label>
                    <Input
                        id={
                            ticket
                                ? `edit-quantity-${ticket.id}`
                                : 'create-quantity'
                        }
                        name="quantity"
                        type="number"
                        min="0"
                        required
                        defaultValue={ticket?.quantity}
                        placeholder="e.g. 100"
                    />
                    <InputError message={errors.quantity} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label
                    htmlFor={ticket ? `edit-desc-${ticket.id}` : 'create-desc'}
                >
                    Description
                </Label>
                <textarea
                    id={ticket ? `edit-desc-${ticket.id}` : 'create-desc'}
                    name="description"
                    rows={3}
                    defaultValue={ticket?.description ?? ''}
                    placeholder="What does this ticket include?"
                    className="flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm"
                />
                <InputError message={errors.description} />
            </div>
        </>
    );
}

function EditTicketDialog({
    event,
    ticket,
}: {
    event: EventInfo;
    ticket: TicketItem;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${ticket.name}`}
                >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit ticket</DialogTitle>
                    <DialogDescription>
                        Update the details of this ticket.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...update.form({ event: event.id, ticket: ticket.id })}
                    onSuccess={() => setOpen(false)}
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <TicketFormFields ticket={ticket} errors={errors} />
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

function DeleteTicketDialog({
    event,
    ticket,
}: {
    event: EventInfo;
    ticket: TicketItem;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${ticket.name}`}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete ticket</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-foreground">
                            {ticket.name}
                        </span>
                        ? Attendees will no longer be able to buy it.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...destroy.form({ event: event.id, ticket: ticket.id })}
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

export default function EventTickets({ event, tickets }: Props) {
    return (
        <>
            <Head title={`Tickets — ${event.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <EventDetailsHeader event={event} />

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Available tickets
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage ticket types and availability for this event.
                        </p>
                    </div>
                    <Button data-test="create-ticket-button" asChild>
                        <Link href={create(event.id)}>
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            New ticket
                        </Link>
                    </Button>
                </div>

                {tickets.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Ticket
                                className="h-6 w-6 text-primary"
                                aria-hidden="true"
                            />
                        </span>
                        <p className="font-medium">No tickets yet</p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            Create your first ticket type for this event and it
                            will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50 text-left">
                                    <th className="px-4 py-3 font-medium">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Price
                                    </th>
                                    <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                        Quantity
                                    </th>
                                    <th className="hidden px-4 py-3 font-medium md:table-cell">
                                        Description
                                    </th>
                                    <th className="hidden px-4 py-3 font-medium lg:table-cell">
                                        Design
                                    </th>
                                    <th className="w-24 px-4 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        className="border-b transition-colors last:border-b-0 hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {ticket.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="secondary">
                                                {formatPrice(ticket.price)}
                                            </Badge>
                                        </td>
                                        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                                            {ticket.quantity}
                                        </td>
                                        <td className="hidden max-w-48 truncate px-4 py-3 text-muted-foreground md:table-cell">
                                            {ticket.description ?? '—'}
                                        </td>
                                        <td className="hidden px-4 py-3 lg:table-cell">
                                            {ticket.design_image_url ? (
                                                <span className="inline-flex items-center gap-2 text-muted-foreground">
                                                    <Image
                                                        className="h-4 w-4"
                                                        aria-hidden="true"
                                                    />
                                                    QR at{' '}
                                                    {Number(
                                                        ticket.qr_code_x,
                                                    ).toFixed(0)}
                                                    %,{' '}
                                                    {Number(
                                                        ticket.qr_code_y,
                                                    ).toFixed(0)}
                                                    %
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <EditTicketDialog
                                                    event={event}
                                                    ticket={ticket}
                                                />
                                                <DeleteTicketDialog
                                                    event={event}
                                                    ticket={ticket}
                                                />
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

EventTickets.layout = {
    breadcrumbs: [
        {
            title: 'Events',
            href: eventsIndex(),
        },
        {
            title: 'Tickets',
            href: eventsIndex(),
        },
    ],
};

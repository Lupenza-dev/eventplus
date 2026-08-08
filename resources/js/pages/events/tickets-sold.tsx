import { Head, router } from '@inertiajs/react';
import {
    Building2,
    CalendarDays,
    CalendarRange,
    RotateCcw,
    Search,
    Ticket,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard, ticketsSold } from '@/routes';

type VendorOption = {
    id: number;
    name: string;
};

type EventOption = {
    id: number;
    vendor_id: number;
    title: string;
};

type SaleItem = {
    id: number;
    customer_name: string;
    phone_number: string | null;
    event_title: string;
    vendor_name: string;
    is_attending: boolean;
    sold_at: string;
};

type SalesPaginator = {
    data: SaleItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

type Filters = {
    date_from: string;
    date_to: string;
    event_id: string;
    vendor_id: string;
};

type Stats = {
    total: number;
    attending: number;
    events: number;
    vendors: number;
};

type Props = {
    sales: SalesPaginator;
    stats: Stats;
    events: EventOption[];
    vendors: VendorOption[];
    filters: Filters;
};

function formatDate(value: string): string {
    return new Date(value).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function StatCard({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Ticket;
    label: string;
    value: number;
}) {
    return (
        <Card className="flex-row items-center gap-4 py-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </span>
            <div>
                <p className="text-2xl font-semibold tracking-tight">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
            </div>
        </Card>
    );
}

export default function TicketsSold({ sales, stats, events, vendors, filters }: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [vendorId, setVendorId] = useState(filters.vendor_id);
    const [eventId, setEventId] = useState(filters.event_id);

    function applyFilters() {
        const query: Record<string, string> = {};

        if (dateFrom) {
            query.date_from = dateFrom;
        }

        if (dateTo) {
            query.date_to = dateTo;
        }

        if (vendorId) {
            query.vendor_id = vendorId;
        }

        if (eventId) {
            query.event_id = eventId;
        }

        router.get(ticketsSold.url(), query, {
            preserveState: true,
            only: ['sales', 'stats', 'events', 'filters'],
        });
    }

    function resetFilters() {
        setDateFrom('');
        setDateTo('');
        setVendorId('');
        setEventId('');

        router.get(ticketsSold.url(), {}, {
            preserveState: true,
            only: ['sales', 'stats', 'events', 'filters'],
        });
    }

    return (
        <>
            <Head title="Tickets Sold" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Tickets Sold</h1>
                        <p className="text-sm text-muted-foreground">
                            Track ticket sales across events, vendors and date ranges.
                        </p>
                    </div>
                </div>

                <Card className="py-5">
                    <CardHeader className="gap-1 px-5">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CalendarRange className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            Filters
                        </CardTitle>
                        <CardDescription>
                            Narrow down sales by date, vendor or event.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-5">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="grid gap-2">
                                <Label htmlFor="filter-date-from">From</Label>
                                <Input
                                    id="filter-date-from"
                                    type="date"
                                    value={dateFrom}
                                    max={dateTo || undefined}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="filter-date-to">To</Label>
                                <Input
                                    id="filter-date-to"
                                    type="date"
                                    value={dateTo}
                                    min={dateFrom || undefined}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Vendor</Label>
                                <Select
                                    value={vendorId}
                                    onValueChange={(value) => {
                                        setVendorId(value);
                                        setEventId('');
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All vendors" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All vendors</SelectItem>
                                        {vendors.map((vendor) => (
                                            <SelectItem key={vendor.id} value={String(vendor.id)}>
                                                {vendor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Event</Label>
                                <Select
                                    value={eventId}
                                    disabled={events.length === 0}
                                    onValueChange={setEventId}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All events" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All events</SelectItem>
                                        {events.map((event) => (
                                            <SelectItem key={event.id} value={String(event.id)}>
                                                {event.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                            <Button variant="outline" onClick={resetFilters}>
                                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                                Reset
                            </Button>
                            <Button onClick={applyFilters}>
                                <Search className="h-4 w-4" aria-hidden="true" />
                                Apply filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Ticket} label="Tickets sold" value={stats.total} />
                    <StatCard icon={Users} label="Attending" value={stats.attending} />
                    <StatCard icon={CalendarDays} label="Events" value={stats.events} />
                    <StatCard icon={Building2} label="Vendors" value={stats.vendors} />
                </div> */}

                {sales.total === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Ticket className="h-6 w-6 text-primary" aria-hidden="true" />
                        </span>
                        <p className="font-medium">No tickets sold</p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            No ticket sales match the current filters.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="overflow-hidden rounded-xl border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 text-left">
                                        <th className="px-4 py-3 font-medium">Customer</th>
                                        <th className="px-4 py-3 font-medium">Phone</th>
                                        <th className="px-4 py-3 font-medium">Event</th>
                                        <th className="px-4 py-3 font-medium">Vendor</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Sold at</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.data.map((sale) => (
                                        <tr
                                            key={sale.id}
                                            className="border-b transition-colors last:border-b-0 hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {sale.customer_name}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {sale.phone_number ?? '—'}
                                            </td>
                                            <td className="px-4 py-3">{sale.event_title}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {sale.vendor_name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {sale.is_attending ? (
                                                    <Badge className="bg-[#00B894]/15 text-[#00B894] hover:bg-[#00B894]/15">
                                                        Attending
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-muted-foreground"
                                                    >
                                                        Not attending
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {formatDate(sale.sold_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                            <p>
                                Showing{' '}
                                <span className="font-medium text-foreground">
                                    {sales.from}–{sales.to}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium text-foreground">{sales.total}</span>{' '}
                                results
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!sales.prev_page_url}
                                    onClick={() =>
                                        sales.prev_page_url &&
                                        router.get(sales.prev_page_url, {}, { preserveState: true })
                                    }
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!sales.next_page_url}
                                    onClick={() =>
                                        sales.next_page_url &&
                                        router.get(sales.next_page_url, {}, { preserveState: true })
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

TicketsSold.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Tickets Sold',
            href: ticketsSold(),
        },
    ],
};

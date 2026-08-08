import { Head, Link, router } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { ArrowUpRight, BarChart3, CalendarDays, Ticket, TrendingUp, Users, Wallet, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard, ticketsSold } from '@/routes';
import { index as eventsIndex } from '@/routes/events';
import { index as usersIndex } from '@/routes/users';

type Stat = {
    events: number;
    tickets_sold: number;
    payment_collected: number;
    attendees: number;
};

type ChartItem = {
    id: number;
    event: string;
    tickets: number;
    payment: number;
};

type Props = {
    stats: Stat;
    chart: ChartItem[];
    years: number[];
    year: number | null;
};

function formatNumber(value: number): string {
    return value.toLocaleString('en-US');
}

function formatCurrency(value: number): string {
    return `TZS ${value.toLocaleString('en-US')}`;
}

const statCards: { key: keyof Stat; label: string; icon: typeof CalendarDays; accent: string }[] = [
    {
        key: 'events',
        label: 'Events',
        icon: CalendarDays,
        accent: 'bg-[#6C5CE7]/10 text-[#6C5CE7]',
    },
    {
        key: 'tickets_sold',
        label: 'Tickets Sold',
        icon: Ticket,
        accent: 'bg-[#8E7CF8]/10 text-[#6C5CE7]',
    },
    {
        key: 'payment_collected',
        label: 'Payment Collected',
        icon: Wallet,
        accent: 'bg-[#00B894]/10 text-[#00B894]',
    },
    {
        key: 'attendees',
        label: 'Attendees',
        icon: Users,
        accent: 'bg-[#FDCB6E]/15 text-[#B8860B]',
    },
];

const quickStartItems = [
    {
        title: 'Events',
        description: 'Create and manage events.',
        href: eventsIndex(),
        icon: CalendarDays,
        accent: 'bg-blue-500/10 text-blue-600',
    },
    {
        title: 'Ticket Sold',
        description: 'Review ticket sales and filters.',
        href: ticketsSold(),
        icon: Ticket,
        accent: 'bg-violet-500/10 text-violet-600',
    },
    {
        title: 'Users',
        description: 'Manage user accounts.',
        href: usersIndex(),
        icon: Users,
        accent: 'bg-amber-500/10 text-amber-600',
    },
];

function StatCard({
    label,
    icon: Icon,
    accent,
    formatted,
}: {
    label: string;
    icon: typeof CalendarDays;
    accent: string;
    formatted: string;
}) {
    return (
        <Card className="py-5">
            <CardContent className="flex items-center gap-4 px-5">
                <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accent}`}
                >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <p className="truncate text-2xl font-semibold tracking-tight">{formatted}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function SalesChart({ chart }: { chart: ChartItem[] }) {
    const maxTickets = Math.max(...chart.map((item) => item.tickets), 1);
    const maxPayment = Math.max(...chart.map((item) => item.payment), 1);

    if (chart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <BarChart3 className="h-6 w-6 text-primary" aria-hidden="true" />
                </span>
                <p className="font-medium">No sales to display yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                    Once tickets are sold, this chart will show tickets and payments per event.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden="true" />
                    Tickets
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-[#00B894]" aria-hidden="true" />
                    Payments
                </span>
            </div>

            <div className="relative">
                <div
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--border)_1px,transparent_1px)] bg-[size:100%_25%] opacity-60"
                    aria-hidden="true"
                />
                <div className="flex h-56 items-end justify-around gap-2">
                    {chart.map((item) => {
                        const ticketHeight = Math.max(
                            Math.round((item.tickets / maxTickets) * 100),
                            4,
                        );
                        const paymentHeight = Math.max(
                            Math.round((item.payment / maxPayment) * 100),
                            4,
                        );

                        return (
                            <div key={item.id} className="flex flex-col items-center gap-2">
                                <div className="flex h-52 items-end gap-1.5">
                                    <div className="group relative flex h-full items-end">
                                        <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-background group-hover:block">
                                            {formatNumber(item.tickets)}
                                        </span>
                                        <span
                                            className="w-5 rounded-t-md bg-primary transition-opacity hover:opacity-80"
                                            style={{ height: `${ticketHeight}%` }}
                                        />
                                    </div>
                                    <div className="group relative flex h-full items-end">
                                        <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-background group-hover:block">
                                            {formatCurrency(item.payment)}
                                        </span>
                                        <span
                                            className="w-5 rounded-t-md bg-[#00B894] transition-opacity hover:opacity-80"
                                            style={{ height: `${paymentHeight}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="w-20 truncate text-center text-xs text-muted-foreground">
                                    {item.event}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function QuickStartCard({
    title,
    description,
    href,
    icon: Icon,
    accent,
}: {
    title: string;
    description: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon: typeof CalendarDays;
    accent: string;
}) {
    return (
        <Link href={href} prefetch className="group block">
            <Card className="h-full py-5 transition-colors group-hover:border-primary/40">
                <CardContent className="flex items-start justify-between gap-4 px-5">
                    <div className="flex items-start gap-3">
                        <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}
                        >
                            <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="font-semibold">{title}</p>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    <ArrowUpRight
                        className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                        aria-hidden="true"
                    />
                </CardContent>
            </Card>
        </Link>
    );
}

export default function Dashboard({ stats, chart, years, year }: Props) {
    function handleYearChange(value: string) {
        router.get(
            dashboard.url(),
            value === 'all' ? {} : { year: value },
            {
                preserveState: true,
                only: ['stats', 'chart', 'year'],
            },
        );
    }

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            Overview of your events, sales and attendance.
                        </p>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="dashboard-year" className="text-xs text-muted-foreground">
                            Year
                        </Label>
                        <Select
                            value={year ? String(year) : 'all'}
                            onValueChange={handleYearChange}
                        >
                            <SelectTrigger id="dashboard-year" className="w-[180px]">
                                <SelectValue placeholder="All years" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All years</SelectItem>
                                {years.map((availableYear) => (
                                    <SelectItem key={availableYear} value={String(availableYear)}>
                                        {availableYear}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map(({ key, label, icon, accent }) => (
                        <StatCard
                            key={key}
                            label={label}
                            icon={icon}
                            accent={accent}
                            formatted={
                                key === 'payment_collected'
                                    ? formatCurrency(stats[key])
                                    : formatNumber(stats[key])
                            }
                        />
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="py-5 lg:col-span-2">
                        <CardHeader className="px-5">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                Sales overview
                            </CardTitle>
                            <CardDescription>
                                Tickets and payments per event.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-5">
                            <SalesChart chart={chart} />
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
                            <Zap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            Quick start
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                            {quickStartItems.map((item) => (
                                <QuickStartCard key={item.title} {...item} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

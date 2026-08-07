import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CreditCard, Tags } from 'lucide-react';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { systemSettings } from '@/routes';
import { index as eventCategoriesIndex } from '@/routes/event-categories';

const settingCards = [
    {
        title: 'Event Categories',
        description:
            'Create and manage the categories used to organize events across the platform.',
        icon: Tags,
        href: eventCategoriesIndex(),
        available: true,
    },
    {
        title: 'Payment Types',
        description:
            'Configure the payment methods attendees can use to purchase tickets.',
        icon: CreditCard,
        href: null,
        available: false,
    },
];

export default function SystemSettings() {
    return (
        <>
            <Head title="System Settings" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        System Settings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage platform-wide configuration from one place.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {settingCards.map((card) =>
                        card.available && card.href ? (
                            <Link
                                key={card.title}
                                href={card.href}
                                prefetch
                                className="group rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                                <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                                    <CardHeader>
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                <card.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                                            </span>
                                            <ArrowRight
                                                className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <CardTitle>{card.title}</CardTitle>
                                        <CardDescription>{card.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ) : (
                            <Card key={card.title} className="h-full opacity-70">
                                <CardHeader>
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <card.icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                        </span>
                                        <Badge variant="secondary">Coming soon</Badge>
                                    </div>
                                    <CardTitle>{card.title}</CardTitle>
                                    <CardDescription>{card.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        ),
                    )}
                </div>
            </div>
        </>
    );
}

SystemSettings.layout = {
    breadcrumbs: [
        {
            title: 'System Settings',
            href: systemSettings(),
        },
    ],
};

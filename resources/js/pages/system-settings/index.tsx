import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CreditCard, Tags } from 'lucide-react';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { systemSettings } from '@/routes';
import { index as eventCategoriesIndex } from '@/routes/event-categories';
import { index as paymentPartnersIndex } from '@/routes/payment-partners';

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
        title: 'Payment Partners',
        description:
            'Manage the payment providers attendees use to purchase tickets.',
        icon: CreditCard,
        href: paymentPartnersIndex(),
        available: true,
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
                    {settingCards.map((card) => (
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
                    ))}
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

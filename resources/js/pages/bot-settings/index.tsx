import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bot,
    GitBranch,
    Link2,
    MessageSquareReply,
    PanelTop,
} from 'lucide-react';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { botSettings } from '@/routes';
import { index as responseThreadLinksIndex } from '@/routes/response-thread-links';
import { index as threadLinksIndex } from '@/routes/thread-links';
import { index as threadMenusIndex } from '@/routes/thread-menus';

const botCards = [
    {
        title: 'Thread Menu',
        description:
            'Create and manage the menu threads the WhatsApp bot presents to users.',
        icon: PanelTop,
        href: threadMenusIndex(),
        available: true,
    },
    // {
    //     title: 'Thread Response',
    //     description:
    //         'Manage the responses shown in list-type thread menus.',
    //     icon: MessageSquareReply,
    //     href: threadMenusIndex(),
    //     available: true,
    // },
    {
        title: 'Thread Response Link',
        description:
            'Link a thread response to the thread it should open.',
        icon: Link2,
        href: responseThreadLinksIndex(),
        available: true,
    },
    {
        title: 'Thread To Thread Link',
        description:
            'Link threads together to build conversational flows.',
        icon: GitBranch,
        href: threadLinksIndex(),
        available: true,
    },
];

export default function BotSettings() {
    return (
        <>
            <Head title="Bot Settings" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-start gap-3">
                    <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
                    </span>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Bot Settings
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Configure the threads that power your WhatsApp bot.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {botCards.map((card) => (
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
                                            <card.icon
                                                className="h-5 w-5 text-primary"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        {card.available ? (
                                            <ArrowRight
                                                className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                                Coming soon
                                            </span>
                                        )}
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

BotSettings.layout = {
    breadcrumbs: [
        {
            title: 'Bot Settings',
            href: botSettings(),
        },
    ],
};

import { Link } from '@inertiajs/react';
import { MessageCircle, QrCode, ShieldCheck, Ticket, Zap } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const highlights = [
    {
        icon: MessageCircle,
        title: 'Book on WhatsApp',
        description: 'Discover events and buy tickets in a single chat.',
    },
    {
        icon: Zap,
        title: 'Instant delivery',
        description: 'QR tickets arrive seconds after payment clears.',
    },
    {
        icon: ShieldCheck,
        title: 'Secure by default',
        description: 'Encrypted payments and verified entry at the gate.',
    },
];

const stats = [
    { value: '500+', label: 'Events' },
    { value: '50k+', label: 'Tickets sold' },
    { value: '10k+', label: 'Users' },
];

function BrandMark({ dark = false }: { dark?: boolean }) {
    return (
        <Link
            href={home()}
            className="inline-flex items-center gap-2"
            aria-label="EventPlus home"
        >
            <span
                className={
                    dark
                        ? 'flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm'
                        : 'flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#6C5CE7] to-[#8E7CF8] shadow-lg shadow-[#6C5CE7]/25'
                }
            >
                <Ticket className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <span
                className={
                    dark
                        ? 'text-lg font-bold tracking-tight text-white'
                        : 'text-lg font-bold tracking-tight text-[#2D3436]'
                }
            >
                Event<span className={dark ? 'text-[#C9BFFF]' : 'text-[#6C5CE7]'}>Plus</span>
            </span>
        </Link>
    );
}

export default function AuthSplitLayout({
    children,
    title,
    description,
    wide = false,
}: AuthLayoutProps) {
    return (
        <div className="grid min-h-dvh bg-[#F8F9FC] lg:grid-cols-2">
            <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-[#5B4BD4] via-[#6C5CE7] to-[#8E7CF8] p-10 text-white lg:flex">
                <div
                    aria-hidden="true"
                    className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
                />
                <div
                    aria-hidden="true"
                    className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-[#FF6B6B]/20 blur-3xl"
                />

                <div className="relative z-10">
                    <BrandMark dark />
                </div>

                <div className="relative z-10 max-w-md">
                    <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
                        <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                        AI-powered WhatsApp ticketing
                    </span>
                    <h2 className="text-3xl leading-tight font-extrabold tracking-tight">
                        Every event, one chat away.
                    </h2>
                    <ul className="mt-8 space-y-5">
                        {highlights.map((item) => (
                            <li key={item.title} className="flex items-start gap-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/12 backdrop-blur-sm">
                                    <item.icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">{item.title}</p>
                                    <p className="text-sm text-white/70">{item.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <dl className="relative z-10 flex gap-10 border-t border-white/15 pt-6">
                    {stats.map((stat) => (
                        <div key={stat.label}>
                            <dd className="text-2xl font-extrabold">{stat.value}</dd>
                            <dt className="text-xs text-white/65">{stat.label}</dt>
                        </div>
                    ))}
                </dl>
            </div>

            <div className="flex items-center justify-center p-6 sm:p-10">
                <div className={wide ? 'w-full max-w-2xl' : 'w-full max-w-md'}>
                    <div className="mb-8 flex justify-center lg:hidden">
                        <BrandMark />
                    </div>
                    <div className="rounded-2xl border border-[#2D3436]/6 bg-white p-8 shadow-xl shadow-[#6C5CE7]/8 sm:p-10">
                        <div className="mb-8 flex flex-col gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-[#2D3436]">
                                {title}
                            </h1>
                            <p className="text-sm text-balance text-[#2D3436]/60">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                    <p className="mt-6 text-center text-xs text-[#2D3436]/45">
                        © {new Date().getFullYear()} EventPlus. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}

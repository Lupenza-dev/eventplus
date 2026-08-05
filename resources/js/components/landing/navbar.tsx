import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Ticket, X } from 'lucide-react';
import { useState } from 'react';
import { login, register } from '@/routes';

const links = [
    { label: 'Home', href: '#home' },
    { label: 'Events', href: '#events' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact Us', href: '#contact' },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-[#2D3436]/5 bg-white/85 backdrop-blur-md">
            <nav
                aria-label="Main navigation"
                className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
            >
                <a href="#home" className="flex items-center gap-2" aria-label="EventPlus home">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#6C5CE7] to-[#8E7CF8] shadow-lg shadow-[#6C5CE7]/25">
                        <Ticket className="h-5 w-5 text-white" aria-hidden="true" />
                    </span>
                    <span className="text-lg font-bold tracking-tight text-[#2D3436]">
                        Event<span className="text-[#6C5CE7]">Plus</span>
                    </span>
                </a>

                <ul className="hidden items-center gap-1 lg:flex">
                    {links.map((link) => (
                        <li key={link.label}>
                            <a
                                href={link.href}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-[#2D3436]/75 transition-colors hover:bg-[#6C5CE7]/8 hover:text-[#6C5CE7]"
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="hidden items-center gap-3 lg:flex">
                    <Link
                        href={login()}
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-[#2D3436] transition-colors hover:text-[#6C5CE7]"
                    >
                        Log in
                    </Link>
                    <Link
                        href={register()}
                        className="rounded-lg bg-[#6C5CE7] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#6C5CE7]/30 transition-all hover:-translate-y-0.5 hover:bg-[#5B4BD4] hover:shadow-xl hover:shadow-[#6C5CE7]/35"
                    >
                        Register
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    className="rounded-lg p-2 text-[#2D3436] transition-colors hover:bg-[#6C5CE7]/8 lg:hidden"
                >
                    {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </nav>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-[#2D3436]/5 bg-white lg:hidden"
                    >
                        <ul className="flex flex-col gap-1 px-4 py-4">
                            {links.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        className="block rounded-lg px-4 py-2.5 text-sm font-medium text-[#2D3436]/80 transition-colors hover:bg-[#6C5CE7]/8 hover:text-[#6C5CE7]"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                            <li className="mt-2 flex gap-3 border-t border-[#2D3436]/5 pt-4">
                                <Link
                                    href={login()}
                                    className="flex-1 rounded-lg border border-[#6C5CE7]/30 px-4 py-2.5 text-center text-sm font-semibold text-[#6C5CE7]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="flex-1 rounded-lg bg-[#6C5CE7] px-4 py-2.5 text-center text-sm font-semibold text-white"
                                >
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

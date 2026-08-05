import { motion } from 'framer-motion';
import { ArrowRight, CheckCheck, MessageCircle, QrCode, Ticket } from 'lucide-react';
import { contact, stats } from './data';

const bubbleVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.96 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { delay: 0.6 + i * 0.55, duration: 0.35, ease: 'easeOut' as const },
    }),
};

function ChatMockup() {
    return (
        <div className="relative mx-auto w-full max-w-sm">
            <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-[3rem] bg-linear-to-br from-[#6C5CE7]/25 via-[#FF6B6B]/15 to-[#00B894]/20 blur-2xl"
            />
            <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-4xl border border-[#2D3436]/8 bg-white shadow-2xl shadow-[#6C5CE7]/15"
            >
                <div className="flex items-center gap-3 bg-[#00B894] px-5 py-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                        <MessageCircle className="h-5 w-5 text-white" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-white">EventPlus Bot</p>
                        <p className="text-xs text-white/80">online · replies instantly</p>
                    </div>
                </div>

                <div className="flex min-h-88 flex-col gap-3 bg-[#F8F9FC] p-5">
                    <motion.div
                        custom={0}
                        variants={bubbleVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-[80%] self-end rounded-2xl rounded-br-sm bg-[#6C5CE7] px-4 py-2.5 text-sm text-white shadow-md"
                    >
                        Hi! Any concerts this weekend? 🎶
                    </motion.div>

                    <motion.div
                        custom={1}
                        variants={bubbleVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-sm text-[#2D3436] shadow-md"
                    >
                        Found 3 events near you! 🎉 <span className="font-semibold">Sauti za Busara</span> — Fri
                        6:00 PM, from <span className="font-semibold text-[#00B894]">$45</span>
                    </motion.div>

                    <motion.div
                        custom={2}
                        variants={bubbleVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-[80%] self-end rounded-2xl rounded-br-sm bg-[#6C5CE7] px-4 py-2.5 text-sm text-white shadow-md"
                    >
                        Book 2 tickets please!
                        <CheckCheck className="ml-1 inline h-4 w-4 text-white/70" aria-hidden="true" />
                    </motion.div>

                    <motion.div
                        custom={3}
                        variants={bubbleVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-white p-3 shadow-md"
                    >
                        <div className="flex items-center gap-3 rounded-xl bg-linear-to-br from-[#6C5CE7] to-[#8E7CF8] p-3 text-white">
                            <QrCode className="h-12 w-12 shrink-0" aria-hidden="true" />
                            <div>
                                <p className="text-xs font-medium text-white/75">Ticket confirmed ✅</p>
                                <p className="text-sm font-bold">Sauti za Busara ×2</p>
                                <p className="text-xs text-white/75">Scan at the gate</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3, duration: 0.4 }}
                className="absolute -right-4 -bottom-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-[#2D3436]/10"
            >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00B894]/10">
                    <Ticket className="h-4 w-4 text-[#00B894]" aria-hidden="true" />
                </span>
                <div>
                    <p className="text-xs font-bold text-[#2D3436]">Delivered in 3s</p>
                    <p className="text-[10px] text-[#2D3436]/50">Average ticket delivery</p>
                </div>
            </motion.div>
        </div>
    );
}

export default function Hero() {
    return (
        <section id="home" className="relative overflow-hidden bg-[#F8F9FC]">
            <div
                aria-hidden="true"
                className="absolute top-0 right-0 h-96 w-96 -translate-y-1/3 translate-x-1/3 rounded-full bg-[#6C5CE7]/10 blur-3xl"
            />
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
                <div className="order-2 lg:order-1">
                    <ChatMockup />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="order-1 lg:order-2"
                >
                    <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00B894]/25 bg-[#00B894]/8 px-4 py-1.5 text-xs font-semibold text-[#00B894]">
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        AI-powered WhatsApp ticketing
                    </span>
                    <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-[#2D3436] sm:text-5xl">
                        Discover Events and Buy Tickets Instantly Through{' '}
                        <span className="bg-linear-to-r from-[#6C5CE7] to-[#FF6B6B] bg-clip-text text-transparent">
                            WhatsApp
                        </span>
                    </h1>
                    <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#2D3436]/65">
                        EventPlus connects event organizers and attendees through an intelligent
                        WhatsApp-powered platform.
                    </p>

                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                        <a
                            href="#events"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C5CE7] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#6C5CE7]/30 transition-all hover:-translate-y-0.5 hover:bg-[#5B4BD4] hover:shadow-xl hover:shadow-[#6C5CE7]/35"
                        >
                            Explore Events
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                        <a
                            href={contact.whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#00B894] px-7 py-3.5 text-sm font-semibold text-[#00B894] transition-all hover:-translate-y-0.5 hover:bg-[#00B894] hover:text-white"
                        >
                            <MessageCircle className="h-4 w-4" aria-hidden="true" />
                            Chat on WhatsApp
                        </a>
                    </div>

                    <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-[#2D3436]/8 pt-8">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }}
                            >
                                <dt className="order-2 text-sm text-[#2D3436]/55">{stat.label}</dt>
                                <dd className="text-2xl font-extrabold text-[#6C5CE7] sm:text-3xl">
                                    {stat.value}
                                </dd>
                            </motion.div>
                        ))}
                    </dl>
                </motion.div>
            </div>
        </section>
    );
}

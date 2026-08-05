import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { events } from './data';
import SectionHeading from './section-heading';

export default function EventsSection() {
    return (
        <section id="events" className="bg-[#F8F9FC] py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Upcoming events"
                    title="Find your next experience"
                    description="Concerts, conferences, sports, and more — book on the site or ask the WhatsApp bot."
                />
                <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((event, i) => (
                        <motion.article
                            key={event.name}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ delay: (i % 3) * 0.12, duration: 0.5 }}
                            className="group overflow-hidden rounded-2xl bg-white shadow-md shadow-[#2D3436]/5 transition-all hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#6C5CE7]/15"
                        >
                            <div className="relative h-48 overflow-hidden bg-[#6C5CE7]/10">
                                <img
                                    src={event.image}
                                    alt={event.name}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#6C5CE7] shadow-sm">
                                    {event.category}
                                </span>
                                <span className="absolute right-4 bottom-4 rounded-lg bg-[#2D3436]/80 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
                                    {event.price}
                                </span>
                            </div>
                            <div className="p-6">
                                <h3 className="mb-3 text-lg font-bold text-[#2D3436]">{event.name}</h3>
                                <div className="mb-5 space-y-1.5 text-sm text-[#2D3436]/60">
                                    <p className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-[#6C5CE7]" aria-hidden="true" />
                                        {event.date}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-[#6C5CE7]" aria-hidden="true" />
                                        {event.location}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B6B] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF6B6B]/25 transition-all hover:-translate-y-0.5 hover:bg-[#F35555] hover:shadow-xl hover:shadow-[#FF6B6B]/30"
                                >
                                    <Ticket className="h-4 w-4" aria-hidden="true" />
                                    Buy Ticket
                                </button>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}

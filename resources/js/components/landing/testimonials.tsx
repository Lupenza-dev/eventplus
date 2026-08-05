import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { testimonials } from './data';
import SectionHeading from './section-heading';

export default function Testimonials() {
    return (
        <section id="testimonials" className="bg-[#F8F9FC] py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Testimonials"
                    title="Loved by attendees and organizers"
                    description="Real stories from people who ditched the queue for a chat."
                />
                <div className="grid gap-7 md:grid-cols-3">
                    {testimonials.map((t, i) => (
                        <motion.figure
                            key={t.name}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ delay: i * 0.12, duration: 0.5 }}
                            className="flex flex-col rounded-2xl bg-white p-7 shadow-md shadow-[#2D3436]/5 transition-all hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#6C5CE7]/15"
                        >
                            <div
                                className="mb-4 flex gap-1"
                                role="img"
                                aria-label="Rated 5 out of 5 stars"
                            >
                                {Array.from({ length: 5 }).map((_, s) => (
                                    <Star
                                        key={s}
                                        className="h-4 w-4 fill-[#FDCB6E] text-[#FDCB6E]"
                                        aria-hidden="true"
                                    />
                                ))}
                            </div>
                            <blockquote className="flex-1 text-sm leading-relaxed text-[#2D3436]/70">
                                “{t.quote}”
                            </blockquote>
                            <figcaption className="mt-6 flex items-center gap-3 border-t border-[#2D3436]/6 pt-5">
                                <img
                                    src={t.image}
                                    alt={t.name}
                                    loading="lazy"
                                    className="h-11 w-11 rounded-full object-cover ring-2 ring-[#6C5CE7]/20"
                                />
                                <div>
                                    <p className="text-sm font-bold text-[#2D3436]">{t.name}</p>
                                    <p className="text-xs text-[#2D3436]/55">{t.role}</p>
                                </div>
                            </figcaption>
                        </motion.figure>
                    ))}
                </div>
            </div>
        </section>
    );
}

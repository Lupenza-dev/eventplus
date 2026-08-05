import { motion } from 'framer-motion';
import { features } from './data';
import SectionHeading from './section-heading';

export default function WhyChoose() {
    return (
        <section id="why-eventplus" className="bg-white py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Why EventPlus"
                    title="Built for organizers and attendees alike"
                    description="Everything you need to sell out an event and everything attendees need to walk straight in."
                />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ delay: (i % 3) * 0.12, duration: 0.5 }}
                            className="group rounded-2xl border border-[#2D3436]/6 p-7 transition-all hover:-translate-y-1.5 hover:border-[#6C5CE7]/25 hover:shadow-xl hover:shadow-[#6C5CE7]/10"
                        >
                            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6C5CE7]/10 transition-colors group-hover:bg-[#6C5CE7]">
                                <feature.icon
                                    className="h-6 w-6 text-[#6C5CE7] transition-colors group-hover:text-white"
                                    aria-hidden="true"
                                />
                            </span>
                            <h3 className="mb-2 text-base font-bold text-[#2D3436]">{feature.title}</h3>
                            <p className="text-sm leading-relaxed text-[#2D3436]/60">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

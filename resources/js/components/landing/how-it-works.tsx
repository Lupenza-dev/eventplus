import { motion } from 'framer-motion';
import { steps } from './data';
import SectionHeading from './section-heading';

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="bg-white py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="How it works"
                    title="From discovery to entry in four steps"
                    description="No apps to install, no queues to stand in. The whole journey happens in a WhatsApp chat."
                />
                <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, i) => (
                        <motion.li
                            key={step.title}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ delay: i * 0.12, duration: 0.5 }}
                            className="group relative rounded-2xl border border-[#2D3436]/6 bg-[#F8F9FC] p-7 transition-all hover:-translate-y-1.5 hover:border-[#6C5CE7]/25 hover:bg-white hover:shadow-xl hover:shadow-[#6C5CE7]/10"
                        >
                            <span className="absolute top-6 right-6 text-4xl font-extrabold text-[#6C5CE7]/10 transition-colors group-hover:text-[#6C5CE7]/20">
                                {i + 1}
                            </span>
                            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#6C5CE7] to-[#8E7CF8] shadow-lg shadow-[#6C5CE7]/25">
                                <step.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </span>
                            <h3 className="mb-2 text-base font-bold text-[#2D3436]">{step.title}</h3>
                            <p className="text-sm leading-relaxed text-[#2D3436]/60">{step.description}</p>
                        </motion.li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

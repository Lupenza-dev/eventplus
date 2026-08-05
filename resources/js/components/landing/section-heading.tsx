import { motion } from 'framer-motion';

interface SectionHeadingProps {
    eyebrow: string;
    title: string;
    description?: string;
}

export default function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-14 max-w-2xl text-center"
        >
            <span className="mb-3 inline-block rounded-full bg-[#6C5CE7]/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#6C5CE7] uppercase">
                {eyebrow}
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#2D3436] sm:text-4xl">{title}</h2>
            {description && <p className="mt-4 text-base leading-relaxed text-[#2D3436]/60">{description}</p>}
        </motion.div>
    );
}

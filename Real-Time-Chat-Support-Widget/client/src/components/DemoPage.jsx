import { motion } from 'framer-motion';
import { ArrowRight, Check, MessageSquare, Zap, Users } from 'lucide-react';
import { useChat } from '../context/ChatContext.jsx';

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Real-Time Messaging',
    description: 'Instant message delivery with Socket.io-powered live updates.',
  },
  {
    icon: Users,
    title: 'Online Presence',
    description: 'See how many support agents are available right now.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed with minimal latency and smart caching.',
  },
];

const BENEFITS = [
  'No setup required — embed in seconds',
  'Works on all devices and browsers',
  'Fully responsive and mobile-optimized',
  'Dark mode included',
  'Conversation history persists',
  'Rich typing indicators',
];

export default function DemoPage() {
  const { setIsOpen } = useChat();

  return (
    <div className="min-h-dvh bg-surface-light dark:bg-surface-dark transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-aurora opacity-40 dark:opacity-30" />

        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block rounded-full bg-brand-gradient-soft px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
              ✨ Production-Ready Widget
            </span>

            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Real-Time Chat Support Widget
            </h1>

            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              A beautiful, embeddable customer support chat widget built with React, Tailwind CSS, and Socket.io.
              Just like Intercom or Crisp, but open and lightweight.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 font-medium text-white shadow-glass-lg transition-transform hover:scale-105"
              >
                Start Chatting <ArrowRight size={16} />
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/60 px-6 py-3 font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-white dark:border-white/10 dark:bg-surface-darkcard dark:text-slate-200">
                View on GitHub
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-display text-3xl font-bold text-slate-900 dark:text-white">
            Powerful Features
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group rounded-2xl border border-slate-100 bg-white/80 p-6 backdrop-blur transition-all hover:border-brand-300 hover:shadow-glass-lg dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient-soft">
                    <Icon size={20} className="text-brand-600 dark:text-brand-300" />
                  </div>
                  <h3 className="mt-4 font-display font-semibold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center font-display text-3xl font-bold text-slate-900 dark:text-white">
            Why Choose This Widget?
          </h2>

          <ul className="mt-12 space-y-4">
            {BENEFITS.map((benefit, i) => (
              <motion.li
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white/50 px-4 py-3 dark:border-white/5 dark:bg-white/5"
              >
                <Check size={18} className="shrink-0 text-online" />
                <span className="text-slate-700 dark:text-slate-200">{benefit}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            Built With Modern Tech
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Production-grade stack: React, Tailwind CSS, Framer Motion, Socket.io, Express, and Node.js.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'React 18', emoji: '⚛️' },
              { name: 'Vite', emoji: '⚡' },
              { name: 'Tailwind CSS', emoji: '🎨' },
              { name: 'Socket.io', emoji: '🔌' },
              { name: 'Express.js', emoji: '🚀' },
              { name: 'Framer Motion', emoji: '✨' },
            ].map((tech) => (
              <div
                key={tech.name}
                className="rounded-lg border border-slate-100 bg-white/80 py-3 dark:border-white/10 dark:bg-white/5"
              >
                <span className="text-2xl">{tech.emoji}</span>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{tech.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden px-4 py-16">
        <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-5" />

        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            Ready to get started?
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Try the chat widget now. It&apos;s running on Socket.io in the corner of this page!
          </p>

          <div className="mt-6 inline-block">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 font-medium text-white shadow-glass-lg transition-transform hover:scale-105"
            >
              Start a Conversation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white/50 px-4 py-8 dark:border-white/5 dark:bg-white/5">
        <div className="mx-auto max-w-4xl text-center text-sm text-slate-600 dark:text-slate-400">
          <p>
            Built with ❤️ for internship excellence. © 2024 Real-Time Chat Support Widget.
          </p>
        </div>
      </footer>
    </div>
  );
}

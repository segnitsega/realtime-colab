'use client';

import { MessageSquare, Users, Zap, Lock, BarChart3, Globe } from 'lucide-react';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: MessageSquare,
    title: 'Instant Messaging',
    description: 'Real-time chat with your team, organized in channels and direct messages.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Create servers, manage roles, and organize your workspace effortlessly.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Sub-100ms latency ensures your team stays in sync at all times.',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'End-to-end encryption and compliance with industry standards.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track team activity and collaboration metrics in real-time.',
  },
  {
    icon: Globe,
    title: 'Global Network',
    description: 'Connect with teams anywhere in the world with zero lag.',
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="w-full border-t border-slate-800/80 bg-slate-900/40 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance text-slate-50 sm:text-4xl lg:text-5xl">
            Powerful features for modern teams
          </h2>
          <p className="max-w-2xl text-balance text-lg text-slate-400">
            Everything you need to collaborate effectively and build amazing things together.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 shadow-lg shadow-slate-950/50 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30 hover:bg-slate-800/70 hover:shadow-xl hover:shadow-blue-500/5 sm:p-8"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 transition group-hover:from-blue-500/30 group-hover:to-indigo-500/30">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-100 sm:text-xl">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

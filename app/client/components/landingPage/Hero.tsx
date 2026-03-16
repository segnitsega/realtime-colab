'use client';

import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden px-4 py-20 sm:px-6 sm:py-32 lg:px-8 lg:py-30">
      {/* Dark blue gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[128px]" />
        <div className="absolute top-1/2 right-0 h-96 w-96 rounded-full bg-indigo-600/15 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-slate-600/10 blur-[80px]" />
      </div>
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(148 163 184) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(148 163 184) 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem',
        }}
      />

      <div className="container relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">
              Real-time collaboration made simple
            </span>
          </div>

          <div className="space-y-5">
            <h1 className="text-4xl font-bold tracking-tight text-balance text-slate-50 sm:text-5xl lg:text-6xl">
              Build together,
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent">
                in real time
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-lg leading-relaxed text-slate-400 sm:text-xl">
              Seamless collaboration with your team. Work in sync, share ideas instantly, and ship faster.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-500 sm:w-auto"
            >
              Start building
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-800/50 px-8 py-3.5 text-base font-semibold text-slate-200 backdrop-blur-sm transition hover:border-slate-500 hover:bg-slate-800/80 sm:w-auto"
            >
              Explore features
            </Link>
          </div>

          <div className="grid w-full max-w-xl grid-cols-3 gap-6 pt-14 sm:gap-8">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-blue-400 sm:text-4xl">10K+</div>
              <p className="text-xs text-slate-500 sm:text-sm">Active teams</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-indigo-400 sm:text-4xl">99.9%</div>
              <p className="text-xs text-slate-500 sm:text-sm">Uptime</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-cyan-400 sm:text-4xl">&lt;100ms</div>
              <p className="text-xs text-slate-500 sm:text-sm">Latency</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

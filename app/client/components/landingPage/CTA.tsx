'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTA() {
  return (
    <section className="relative w-full overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/15 blur-[100px] pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-6xl">
        <div className="rounded-3xl border border-slate-700/60 bg-slate-800/40 p-8 text-center shadow-2xl shadow-slate-950/80 backdrop-blur-xl sm:p-12 lg:p-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">Get started free</span>
          </div>

          <div className="mt-6 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-balance text-slate-50 sm:text-4xl lg:text-5xl">
              Ready to transform your collaboration?
            </h2>
            <p className="mx-auto max-w-2xl text-balance text-lg text-slate-400 sm:text-xl">
              Join thousands of teams using realtime co-lab to build faster and smarter together.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-600/25 transition hover:from-blue-500 hover:to-indigo-500 sm:w-auto"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/signin"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-700/30 px-8 py-3.5 text-base font-semibold text-slate-200 transition hover:bg-slate-700/50 sm:w-auto"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-10 border-t border-slate-700/80 pt-8">
            <p className="text-sm text-slate-500">
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

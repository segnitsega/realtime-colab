import { Header } from '@/components/landingPage/Header';
import { Hero } from '@/components/landingPage/Hero';
import { Features } from '@/components/landingPage/Features';
import { CTA } from '@/components/landingPage/CTA';
import { Footer } from '@/components/landingPage/Footer';

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-slate-950 text-slate-50">
      <Header />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </main>
  );
}

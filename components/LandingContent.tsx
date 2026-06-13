'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, BarChart3, Globe, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/LanguageContext';

const HeroScene = dynamic(() => import('@/components/landing/HeroScene'), {
  ssr: false,
  loading: () => null,
});

export default function LandingContent() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Layers,
      title: t.landing.multiIssuer,
      desc: t.landing.multiIssuerDesc,
    },
    {
      icon: Globe,
      title: t.landing.globalMapping,
      desc: t.landing.globalMappingDesc,
    },
    {
      icon: ShieldCheck,
      title: t.landing.serverless,
      desc: t.landing.serverlessDesc,
    },
  ];

  return (
    <main className="relative w-full overflow-hidden bg-[#030712] text-white">
      {/* ===================== HERO ===================== */}
      <section className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
        {/* 3D canvas layer */}
        <div className="absolute inset-0 z-0">
          <HeroScene />
        </div>

        {/* Readability + glow overlays */}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,7,18,0.55)_55%,rgba(3,7,18,0.92)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-[#030712] to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Three.js · Real-time Analytics
          </div>

          <h1 className="text-pretty text-5xl font-black uppercase leading-[0.95] tracking-tighter sm:text-6xl md:text-8xl">
            {t.landing.unveil}{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(34,211,238,0.45)]">
              {t.landing.exposure}
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-pretty text-lg font-light leading-relaxed tracking-wide text-slate-300 md:text-2xl">
            {t.landing.subtitle}
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
            <Button
              render={<Link href="/analyzer" />}
              nativeButton={false}
              size="lg"
              className="group border-0 bg-gradient-to-r from-cyan-400 to-blue-500 px-10 py-7 text-base font-bold uppercase tracking-widest text-[#030712] shadow-[0_0_30px_rgba(34,211,238,0.35)] transition-all hover:shadow-[0_0_45px_rgba(34,211,238,0.6)]"
            >
              {t.landing.launchSystem}
              <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              render={<Link href="/about" />}
              nativeButton={false}
              variant="outline"
              size="lg"
              className="border-white/20 bg-white/5 px-10 py-7 text-base font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              {t.navbar.about}
            </Button>
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/30 p-1">
            <span className="h-2 w-1 animate-bounce rounded-full bg-cyan-300" />
          </div>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/40"
              >
                {/* hover glow */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 transition-colors group-hover:bg-cyan-400/20">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="relative mb-3 text-xl font-bold uppercase tracking-wider text-white">
                  {f.title}
                </h3>
                <p className="relative font-light leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* stats band */}
        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
          {[
            { value: '4+', label: 'Issuers' },
            { value: '1000s', label: 'Holdings' },
            { value: '100%', label: 'Client-side' },
            { value: '3D', label: 'Visualization' },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center bg-[#070b16] px-4 py-10 text-center"
            >
              <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-5xl">
                {s.value}
              </span>
              <span className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* final CTA */}
        <div className="relative mt-20 overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-transparent to-blue-500/10 px-6 py-16 text-center">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[100px]" />
          <BarChart3 className="relative mx-auto mb-6 h-10 w-10 text-cyan-300" />
          <h2 className="relative text-balance text-3xl font-black uppercase tracking-tighter text-white md:text-5xl">
            {t.landing.unveil}{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
              {t.landing.exposure}
            </span>
          </h2>
          <div className="relative mt-8 flex justify-center">
            <Button
              render={<Link href="/analyzer" />}
              nativeButton={false}
              size="lg"
              className="group border-0 bg-gradient-to-r from-cyan-400 to-blue-500 px-10 py-7 text-base font-bold uppercase tracking-widest text-[#030712] shadow-[0_0_30px_rgba(34,211,238,0.35)] transition-all hover:shadow-[0_0_45px_rgba(34,211,238,0.6)]"
            >
              {t.landing.launchSystem}
              <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { DesktopLinks, DesktopActions } from './DesktopNav';
import { MobileNav } from './MobileNav';

export default function Navbar() {
  const { t } = useTranslation();

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="flex justify-between h-16 items-center w-full">
          <Link
            href="/"
            className="flex items-center gap-3 relative z-10 hover:opacity-90 transition-opacity"
          >
            <Image
              src="/logo.svg"
              alt="Capital Lens"
              width={32}
              height={32}
              className="w-8 h-8 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            />
            <div className="font-black text-xl tracking-widest uppercase hidden sm:block">
              <span className="text-foreground">Capital</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                Lens
              </span>
            </div>
          </Link>

          {/* Center: Desktop Nav */}
          <DesktopLinks t={t} />

          {/* Right: Theme Switcher & Mobile Nav */}
          <div className="flex items-center gap-4 justify-end relative z-10">
            <DesktopActions t={t} />
            <MobileNav t={t} />
          </div>
        </div>
      </div>
    </nav>
  );
}

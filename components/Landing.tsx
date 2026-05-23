"use client";

import { ContactDrawer } from "@/components/ContactDrawer";
import { LogoHero } from "@/components/LogoHero";

export function Landing() {
  return (
    <main className="flex h-dvh max-h-dvh flex-col items-center justify-center overflow-hidden px-4 pb-6 sm:pb-10">
      <LogoHero />

      <h1 className="mt-[1lh] max-w-lg text-center text-xl font-light leading-tight tracking-tight text-white sm:text-2xl md:text-3xl">
        Helping people have more time
      </h1>

      <ContactDrawer />
    </main>
  );
}

import type { Metadata } from "next";
import Hero from "@/components/Hero";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Register — Free Biology Strategy & Roadmap Session",
  description:
    "Register free for Atomic Pathshala's live Biology Strategy & Roadmap Session on Google Meet. NEET Biology strategy, roadmap, study plan, NCERT approach and doubt discussion.",
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return (
    <main className="min-h-dvh bg-ink bg-grain">
      <Hero />
      <section className="relative px-5 pb-16">
        <div className="mx-auto flex max-w-md justify-center">
          <RegisterForm />
        </div>
      </section>
      <footer className="border-t border-ink-line px-5 py-6 text-center">
        <p className="font-mono text-[11px] tracking-wide text-paper/30">
          © {new Date().getFullYear()} Atomic Pathshala. All rights reserved.
        </p>
      </footer>
    </main>
  );
}

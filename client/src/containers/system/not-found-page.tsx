"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import { ArrowLeft, Home } from "lucide-react";

function NotFoundPage() {
  const router = useRouter();

  return (
    <section className="layout-standard flex-center flex-col h-svh">
      <div className="flex items-center gap-3">
        <span
          className="text-5xl md:text-6xl font-extrabold tracking-tight"
          style={{
            color: "var(--primary)",
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          404
        </span>
        <span className="h-8 w-px bg-[var(--border)]" />
        <p className="text-sm md:text-base text-[var(--muted-foreground)]">
          The page you&apos;re looking for doesn&apos;t exist—or it moved.
        </p>
      </div>

      <h2 className="mt-6 text-2xl md:text-3xl font-semibold text-[var(--heading)]">
        Lost in the <span className="text-primary">sauce?</span> 🍝
      </h2>
      <p className="mt-2 text-[var(--paragraph)]">
        Let&apos;s get you back to delicious things. You can return home, go
        back, or try refreshing.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link href="/" className="w-full sm:w-auto">
          <Button className="w-full h-[45px] bg-accent text-accent-foreground font-semibold hover:bg-accent-hover px-8">
            <Home className="mr-1 h-4 w-4" />
            Go Home
          </Button>
        </Link>

        <Button
          variant="outline"
          className="w-full sm:w-auto px-8 h-[46px] hover:bg-background hover:text-accent"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Go Back
        </Button>
      </div>
    </section>
  );
}

export default NotFoundPage;

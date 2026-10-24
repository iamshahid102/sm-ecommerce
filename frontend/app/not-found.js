import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-soft-gradient px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-card sm:p-12">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-hero-gradient text-white shadow-lg shadow-primary/25">
          <Compass className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-6 text-sm font-semibold tracking-widest text-primary uppercase">
          404
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">
          This page could not be found
        </h1>
        <p className="mt-3 text-muted-foreground">
          The link may be broken, or the page may have moved. Return to the
          storefront to keep exploring.
        </p>
        <Button asChild className="mt-7 rounded-xl">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>
        </Button>
      </div>
    </main>
  );
}

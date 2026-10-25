import Link from "next/link";
import { Home, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[linear-gradient(180deg,#F8FAFC_0%,#E0ECFF_100%)] px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border bg-white/90 p-8 text-center shadow-card backdrop-blur sm:p-12">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
          <SearchX className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-semibold tracking-widest text-primary uppercase">
          404
        </p>
        <h1 className="mt-2 font-heading text-2xl font-semibold sm:text-3xl">
          We could not find that page
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The link may be broken, or the page may have moved. Start from the
          storefront and browse the latest products.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/">
              <Home className="size-4" aria-hidden="true" />
              Go to homepage
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

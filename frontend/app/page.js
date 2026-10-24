import {
  ArrowRight,
  CheckCircle2,
  Database,
  Layers3,
  LockKeyhole,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const palette = [
  { name: "Primary Blue", hex: "#2563EB", className: "bg-[#2563EB]" },
  { name: "Deep Blue", hex: "#1E3A8A", className: "bg-[#1E3A8A]" },
  { name: "Sky Blue", hex: "#38BDF8", className: "bg-[#38BDF8]" },
  { name: "Ink", hex: "#0B0F1A", className: "bg-[#0B0F1A]" },
  { name: "Soft White", hex: "#F8FAFC", className: "bg-[#F8FAFC]" },
];

const foundation = [
  {
    icon: Layers3,
    title: "Storefront shell",
    description:
      "Next.js App Router with JavaScript, Tailwind CSS v4 tokens, shadcn/ui primitives, and accessible responsive defaults.",
    meta: "frontend/",
  },
  {
    icon: ServerCog,
    title: "REST API service",
    description:
      "Express 5 with layered routes, controllers, services, Zod validation, structured logging, and a health endpoint.",
    meta: "backend/",
  },
  {
    icon: ShieldCheck,
    title: "Security baseline",
    description:
      "Helmet, strict CORS, rate limiting, server-side Supabase clients, and no service-role key in the browser bundle.",
    meta: "Secure",
  },
];

const nextPhases = [
  "Admin catalog, product images, variants, and categories",
  "Storefront browsing, search, filters, and product pages",
  "Cart, checkout, coupons, orders, and payments",
];

export default function FoundationPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="bg-dark-gradient px-4 py-2 text-center text-xs font-medium tracking-wide text-white/80">
        Phase 1 · Database, Row Level Security, and secure accounts are ready.
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 glass-dark text-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-hero-gradient text-sm font-bold shadow-lg shadow-primary/30">
              SM
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight">
              SM Store
            </span>
          </Link>

          <nav
            aria-label="Foundation"
            className="hidden items-center gap-7 text-sm text-white/70 md:flex"
          >
            <a
              className="transition-colors hover:text-white"
              href="#foundation"
            >
              Foundation
            </a>
            <a className="transition-colors hover:text-white" href="#design">
              Design system
            </a>
            <a className="transition-colors hover:text-white" href="#roadmap">
              Roadmap
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="hidden border-white/20 bg-white/5 text-white sm:inline-flex"
            >
              v0.2.0
            </Badge>
            <Button
              asChild
              size="sm"
              className="rounded-xl bg-hero-gradient text-white shadow-lg shadow-primary/20 hover:opacity-95"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <section className="relative isolate overflow-hidden bg-dark-gradient text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.22),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(37,99,235,0.35),transparent_40%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] bg-[size:56px_56px]"
          />

          <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-28">
            <div>
              <Badge className="mb-6 border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-sky-200">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Single-vendor commerce, built for Pakistan
              </Badge>

              <h1 className="max-w-2xl font-heading text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                A commerce foundation that is{" "}
                <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-white bg-clip-text text-transparent">
                  secure by default.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                SM Store pairs a fast Next.js storefront with an Express API and
                Supabase. Server-side pricing, transactional stock, and a
                role-locked admin are designed in from the start.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-11 rounded-xl bg-hero-gradient px-6 text-white shadow-lg shadow-blue-500/25 hover:opacity-95"
                >
                  <a href="#foundation">
                    Explore the foundation
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 rounded-xl border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
                >
                  <a href="#design">View design tokens</a>
                </Button>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <div>
                  <dt className="text-xs tracking-wide text-slate-400 uppercase">
                    Currency
                  </dt>
                  <dd className="mt-1 font-heading text-lg font-semibold">
                    PKR
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-slate-400 uppercase">
                    Payments
                  </dt>
                  <dd className="mt-1 font-heading text-lg font-semibold">
                    COD + Card
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-slate-400 uppercase">
                    Admin
                  </dt>
                  <dd className="mt-1 font-heading text-lg font-semibold">
                    Exactly one
                  </dd>
                </div>
              </dl>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-[2rem] bg-sky-400/10 blur-3xl"
              />
              <Card className="relative gap-0 overflow-hidden rounded-2xl border-white/10 bg-white/[0.06] py-0 text-white shadow-2xl backdrop-blur">
                <CardHeader className="border-b border-white/10 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium text-white">
                      Stack readiness
                    </CardTitle>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-300">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      Phase 1
                    </span>
                  </div>
                  <CardDescription className="text-slate-400">
                    Schema, policies, and auth guards are wired.
                  </CardDescription>
                </CardHeader>
                <CardContent className="divide-y divide-white/10 p-0">
                  {[
                    ["Next.js 16 App Router", "Configured"],
                    ["Tailwind v4 design tokens", "Ready"],
                    ["Express 5 API + health route", "Ready"],
                    ["Supabase schema + RLS", "Ready"],
                    ["Admin seed + auth guards", "Ready"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between px-6 py-4 text-sm"
                    >
                      <span className="flex items-center gap-2.5 text-slate-300">
                        <CheckCircle2
                          className={`size-4 ${
                            value.startsWith("Phase")
                              ? "text-slate-500"
                              : "text-emerald-400"
                          }`}
                          aria-hidden="true"
                        />
                        {label}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          value.startsWith("Phase")
                            ? "text-slate-500"
                            : "text-emerald-300"
                        }`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="foundation"
          className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">
              What is in place
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
              A clean base for every phase ahead
            </h2>
            <p className="mt-4 text-muted-foreground">
              The monorepo separates presentation from business logic. The
              frontend never holds privileged keys, and every write will pass
              through validated API services.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {foundation.map((item) => (
              <Card
                key={item.title}
                className="group rounded-2xl border-border/70 shadow-card card-lift hover:-translate-y-1 hover:shadow-lift"
              >
                <CardHeader>
                  <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-secondary text-primary ring-1 ring-primary/10">
                    <item.icon className="size-5" aria-hidden="true" />
                  </span>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <code className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {item.meta}
                  </code>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: LockKeyhole,
                title: "Least privilege",
                text: "RLS on every table, scoped customer queries, and server-only service keys.",
              },
              {
                icon: Database,
                title: "Transactional orders",
                text: "Row-locked stock checks and server-recalculated totals in one RPC.",
              },
              {
                icon: Truck,
                title: "Pakistan-first",
                text: "PKR pricing, COD, shipping rules, and order tracking built in.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-3 rounded-2xl border bg-card p-5"
              >
                <item.icon
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="design" className="scroll-mt-20 border-y bg-soft-gradient">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold tracking-widest text-primary uppercase">
                  Design system
                </p>
                <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
                  Blue, white, and ink — with intent
                </h2>
                <p className="mt-4 max-w-lg text-muted-foreground">
                  Poppins for headings, Inter for body copy, rounded-2xl cards,
                  and gradients reserved for hero, CTA, and promotional moments.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button className="rounded-xl bg-hero-gradient text-white">
                    Primary action
                  </Button>
                  <Button variant="secondary" className="rounded-xl">
                    Secondary
                  </Button>
                  <Button variant="outline" className="rounded-xl">
                    Outline
                  </Button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Badge className="bg-success/10 text-success">
                    Delivered
                  </Badge>
                  <Badge className="bg-warning/10 text-warning">Pending</Badge>
                  <Badge className="bg-destructive/10 text-destructive">
                    Cancelled
                  </Badge>
                  <Badge className="bg-sale-gradient text-white">-25%</Badge>
                </div>
              </div>

              <Card className="rounded-2xl border-white/60 bg-white/80 shadow-card backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg">Core palette</CardTitle>
                  <CardDescription>
                    Theme tokens exposed through Tailwind v4 CSS variables.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {palette.map((color) => (
                    <div
                      key={color.name}
                      className="flex items-center gap-3 rounded-xl border bg-background/60 p-2.5"
                    >
                      <span
                        className={`size-10 rounded-lg ring-1 ring-black/10 ${color.className}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{color.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {color.hex}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="roadmap"
          className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold tracking-widest text-primary uppercase">
                Next up
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
                Phase 2: catalog management
              </h2>
              <p className="mt-4 max-w-lg text-muted-foreground">
                Product, category, brand, variant, and image management comes
                next. The public storefront and checkout follow after that.
              </p>
              <Button asChild className="mt-7 rounded-xl">
                <Link href="/login">
                  Sign in to your account
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <ol className="space-y-3">
              {nextPhases.map((phase, index) => (
                <li
                  key={phase}
                  className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-card"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm text-foreground/90">{phase}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="mt-auto bg-dark-gradient text-slate-300">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-hero-gradient text-xs font-bold text-white">
              SM
            </span>
            <span className="font-heading text-sm font-semibold text-white">
              SM Store
            </span>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} SM Store. Built with Next.js, Express,
            and Supabase.
          </p>
        </div>
      </footer>
    </div>
  );
}

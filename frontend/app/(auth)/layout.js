import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const trustPoints = [
  {
    icon: MailCheck,
    title: "Verified accounts",
    description:
      "Email confirmation keeps customer accounts and order updates tied to a real inbox.",
  },
  {
    icon: ShieldCheck,
    title: "Role-protected admin",
    description:
      "Only the single seeded admin account can open the management area or call admin APIs.",
  },
  {
    icon: LockKeyhole,
    title: "Server-side enforcement",
    description:
      "Every API request verifies the Supabase token and reloads the current role from the database.",
  },
];

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden bg-dark-gradient p-10 text-white lg:flex lg:min-h-svh lg:flex-col xl:p-14">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(56,189,248,0.22),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(37,99,235,0.38),transparent_40%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)] bg-[size:56px_56px]"
        />

        <div className="relative flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-hero-gradient text-sm font-bold shadow-lg shadow-primary/30">
              SM
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight">
              SM Store
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to store
          </Link>
        </div>

        <div className="relative my-auto max-w-xl py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-200">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Secure accounts, built in
          </span>
          <h2 className="mt-6 font-heading text-4xl leading-tight font-semibold tracking-tight xl:text-5xl">
            One account for orders, reviews, and a faster checkout.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300">
            Your customer account stays separate from the single admin account.
            Supabase handles credentials; the store API enforces every role on
            the server.
          </p>

          <ul className="mt-10 space-y-4">
            {trustPoints.map((point) => (
              <li key={point.title} className="flex gap-3.5">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sky-300">
                  <point.icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {point.title}
                  </h3>
                  <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-400">
                    {point.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-slate-400">
          <CheckCircle2
            className="size-4 text-emerald-400"
            aria-hidden="true"
          />
          Row Level Security is enabled on every table.
        </div>
      </aside>

      <div className="flex min-h-svh flex-col">
        <header className="flex items-center justify-between border-b px-4 py-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-hero-gradient text-xs font-bold text-white">
              SM
            </span>
            <span className="font-heading text-base font-semibold">
              SM Store
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Store
          </Link>
        </header>

        <main
          id="main-content"
          className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:py-14"
        >
          <div className="w-full max-w-md">{children}</div>
        </main>

        <footer className="px-4 pb-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} SM Store. Need help?{" "}
          <Link href="/" className="text-primary hover:underline">
            Visit the store
          </Link>
          .
        </footer>
      </div>
    </div>
  );
}

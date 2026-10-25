import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/store/contact-form";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetchPublic } from "@/lib/api/public";
import { getSessionProfile } from "@/lib/auth/dal";

export const metadata = {
  title: "Contact us",
  description:
    "Questions about an order, delivery, or a product? Contact SM Store.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [session, settings] = await Promise.all([
    getSessionProfile(),
    apiFetchPublic("/settings").catch(() => null),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          We are here to help
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Contact SM Store
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Ask about an order, delivery, a product, or a return. We will get back
          to you as soon as possible.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-2xl shadow-none">
          <CardContent className="p-6">
            <ContactForm
              defaultName={session.profile?.full_name || ""}
              defaultEmail={session.profile?.email || ""}
            />
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="rounded-2xl shadow-none">
            <CardContent className="space-y-4 p-6 text-sm">
              <h2 className="font-heading text-base font-semibold">
                Store details
              </h2>
              {settings?.contact_email ? (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="flex items-start gap-3 text-muted-foreground hover:text-foreground"
                >
                  <Mail className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                  {settings.contact_email}
                </a>
              ) : null}
              {settings?.contact_phone ? (
                <a
                  href={`tel:${settings.contact_phone}`}
                  className="flex items-start gap-3 text-muted-foreground hover:text-foreground"
                >
                  <Phone className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                  {settings.contact_phone}
                </a>
              ) : null}
              {settings?.whatsapp_number ? (
                <p className="flex items-start gap-3 text-muted-foreground">
                  <Phone className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                  WhatsApp: {settings.whatsapp_number}
                </p>
              ) : null}
              {settings?.address || settings?.city ? (
                <p className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                  {[settings.address, settings.city, settings.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              ) : null}
              <p className="flex items-start gap-3 text-muted-foreground">
                <Clock className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                Monday to Saturday, 10am – 8pm
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-secondary/60 shadow-none">
            <CardContent className="p-6 text-sm leading-relaxed text-secondary-foreground">
              <p className="font-semibold">Order help</p>
              <p className="mt-1 text-xs">
                Include your order number when contacting us about an existing
                order so we can help faster.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

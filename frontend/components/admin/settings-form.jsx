"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api/client";

function toForm(settings) {
  return {
    store_name: settings?.store_name ?? "SM Store",
    store_tagline: settings?.store_tagline ?? "",
    logo_url: settings?.logo_url ?? "",
    favicon_url: settings?.favicon_url ?? "",
    currency: settings?.currency ?? "PKR",
    currency_symbol: settings?.currency_symbol ?? "Rs",
    shipping_fee:
      settings?.shipping_fee != null ? String(settings.shipping_fee) : "0",
    free_shipping_threshold:
      settings?.free_shipping_threshold != null
        ? String(settings.free_shipping_threshold)
        : "",
    tax_percent:
      settings?.tax_percent != null ? String(settings.tax_percent) : "0",
    cod_enabled: settings?.cod_enabled !== false,
    card_enabled: Boolean(settings?.card_enabled),
    contact_email: settings?.contact_email ?? "",
    contact_phone: settings?.contact_phone ?? "",
    whatsapp_number: settings?.whatsapp_number ?? "",
    address: settings?.address ?? "",
    city: settings?.city ?? "",
    country: settings?.country ?? "PK",
    announcement_text: settings?.announcement_text ?? "",
    announcement_active: Boolean(settings?.announcement_active),
    meta_title: settings?.meta_title ?? "",
    meta_description: settings?.meta_description ?? "",
    og_image_url: settings?.og_image_url ?? "",
    facebook: settings?.social_links?.facebook ?? "",
    instagram: settings?.social_links?.instagram ?? "",
    twitter: settings?.social_links?.twitter ?? "",
    tiktok: settings?.social_links?.tiktok ?? "",
    youtube: settings?.social_links?.youtube ?? "",
  };
}

export function SettingsForm({ settings }) {
  const router = useRouter();
  const [values, setValues] = useState(() => toForm(settings));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setPending(true);

    const body = {
      store_name: values.store_name,
      store_tagline: values.store_tagline,
      logo_url: values.logo_url,
      favicon_url: values.favicon_url,
      currency: values.currency,
      currency_symbol: values.currency_symbol,
      shipping_fee: values.shipping_fee,
      free_shipping_threshold: values.free_shipping_threshold || null,
      tax_percent: values.tax_percent,
      cod_enabled: values.cod_enabled,
      card_enabled: false,
      contact_email: values.contact_email || null,
      contact_phone: values.contact_phone,
      whatsapp_number: values.whatsapp_number,
      address: values.address,
      city: values.city,
      country: values.country,
      social_links: {
        facebook: values.facebook,
        instagram: values.instagram,
        twitter: values.twitter,
        tiktok: values.tiktok,
        youtube: values.youtube,
      },
      announcement_text: values.announcement_text,
      announcement_active: values.announcement_active,
      meta_title: values.meta_title,
      meta_description: values.meta_description,
      og_image_url: values.og_image_url,
    };

    try {
      await apiFetch("/admin/settings", { method: "PUT", body });
      toast.success("Store settings saved.");
      router.refresh();
    } catch (submitError) {
      const details = Array.isArray(submitError?.details)
        ? submitError.details.map((item) => item.message).join(" ")
        : "";
      setError(details || submitError.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          Save settings
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Settings could not be saved</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle>Store identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="settings-name">Store name</Label>
              <Input
                id="settings-name"
                value={values.store_name}
                onChange={(event) => update("store_name", event.target.value)}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="settings-tagline">Tagline</Label>
              <Input
                id="settings-tagline"
                value={values.store_tagline}
                onChange={(event) => update("store_tagline", event.target.value)}
                maxLength={160}
                className="mt-1.5"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="settings-logo">Logo URL</Label>
                <Input
                  id="settings-logo"
                  value={values.logo_url}
                  onChange={(event) => update("logo_url", event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="settings-favicon">Favicon URL</Label>
                <Input
                  id="settings-favicon"
                  value={values.favicon_url}
                  onChange={(event) => update("favicon_url", event.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="settings-currency">Currency code</Label>
                <Input
                  id="settings-currency"
                  value={values.currency}
                  onChange={(event) =>
                    update("currency", event.target.value.toUpperCase())
                  }
                  maxLength={3}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="settings-symbol">Currency symbol</Label>
                <Input
                  id="settings-symbol"
                  value={values.currency_symbol}
                  onChange={(event) =>
                    update("currency_symbol", event.target.value)
                  }
                  maxLength={8}
                  className="mt-1.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle>Shipping and tax</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="settings-shipping">Shipping fee</Label>
                <Input
                  id="settings-shipping"
                  type="number"
                  step="0.01"
                  min="0"
                  value={values.shipping_fee}
                  onChange={(event) => update("shipping_fee", event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="settings-free-shipping">
                  Free shipping threshold
                </Label>
                <Input
                  id="settings-free-shipping"
                  type="number"
                  step="0.01"
                  min="0"
                  value={values.free_shipping_threshold}
                  onChange={(event) =>
                    update("free_shipping_threshold", event.target.value)
                  }
                  placeholder="No free shipping"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="settings-tax">Tax percent</Label>
              <Input
                id="settings-tax"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={values.tax_percent}
                onChange={(event) => update("tax_percent", event.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-start gap-3 rounded-xl border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={values.cod_enabled}
                  onChange={(event) =>
                    update("cod_enabled", event.target.checked)
                  }
                  className="mt-0.5 size-4 rounded border-input"
                />
                <span>
                  <span className="block font-medium">Cash on Delivery</span>
                  <span className="block text-xs text-muted-foreground">
                    Allow customers to pay when their order arrives.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3 text-sm opacity-70">
                <input
                  type="checkbox"
                  checked={false}
                  readOnly
                  disabled
                  className="mt-0.5 size-4 rounded border-input"
                />
                <span>
                  <span className="block font-medium">Card payments</span>
                  <span className="block text-xs text-muted-foreground">
                    Unavailable until a payment provider is connected.
                  </span>
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle>Contact details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="settings-email">Contact email</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={values.contact_email}
                  onChange={(event) => update("contact_email", event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="settings-phone">Phone</Label>
                <Input
                  id="settings-phone"
                  value={values.contact_phone}
                  onChange={(event) => update("contact_phone", event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="settings-whatsapp">WhatsApp</Label>
                <Input
                  id="settings-whatsapp"
                  value={values.whatsapp_number}
                  onChange={(event) =>
                    update("whatsapp_number", event.target.value)
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="settings-city">City</Label>
                <Input
                  id="settings-city"
                  value={values.city}
                  onChange={(event) => update("city", event.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="settings-address">Address</Label>
              <Input
                id="settings-address"
                value={values.address}
                onChange={(event) => update("address", event.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="settings-country">Country code</Label>
              <Input
                id="settings-country"
                value={values.country}
                onChange={(event) =>
                  update("country", event.target.value.toUpperCase())
                }
                maxLength={2}
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle>Announcement and social</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="settings-announcement">Announcement text</Label>
              <Input
                id="settings-announcement"
                value={values.announcement_text}
                onChange={(event) =>
                  update("announcement_text", event.target.value)
                }
                maxLength={200}
                className="mt-1.5"
              />
            </div>
            <label className="flex items-center gap-2 rounded-xl border p-3 text-sm">
              <input
                type="checkbox"
                checked={values.announcement_active}
                onChange={(event) =>
                  update("announcement_active", event.target.checked)
                }
                className="size-4 rounded border-input"
              />
              Show announcement bar
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["facebook", "Facebook"],
                ["instagram", "Instagram"],
                ["twitter", "X / Twitter"],
                ["tiktok", "TikTok"],
                ["youtube", "YouTube"],
              ].map(([key, label]) => (
                <div key={key}>
                  <Label htmlFor={`social-${key}`}>{label}</Label>
                  <Input
                    id={`social-${key}`}
                    value={values[key]}
                    onChange={(event) => update(key, event.target.value)}
                    placeholder="https://"
                    className="mt-1.5"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none xl:col-span-2">
          <CardHeader>
            <CardTitle>SEO defaults</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="settings-meta-title">Meta title</Label>
              <Input
                id="settings-meta-title"
                value={values.meta_title}
                onChange={(event) => update("meta_title", event.target.value)}
                maxLength={70}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="settings-og">Open Graph image URL</Label>
              <Input
                id="settings-og"
                value={values.og_image_url}
                onChange={(event) => update("og_image_url", event.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="settings-meta-description">Meta description</Label>
              <Textarea
                id="settings-meta-description"
                value={values.meta_description}
                onChange={(event) =>
                  update("meta_description", event.target.value)
                }
                maxLength={180}
                rows={3}
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          Save settings
        </Button>
      </div>
    </form>
  );
}

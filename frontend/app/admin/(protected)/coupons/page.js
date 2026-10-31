import Link from "next/link";
import { AlertTriangle, Search } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { CouponManager } from "@/components/admin/coupon-manager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetchServerFull } from "@/lib/api/server";
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";

export const metadata = {
  title: "Coupons",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage({ searchParams }) {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  const raw = await searchParams;
  const q = Array.isArray(raw.q) ? raw.q[0] : raw.q || "";
  const activeOnly = raw.activeOnly === "true" ? "true" : "false";
  const page = Array.isArray(raw.page) ? raw.page[0] : raw.page || "1";

  let payload = null;
  let error = null;

  try {
    payload = await apiFetchServerFull(
      `/admin/coupons?q=${encodeURIComponent(q)}&activeOnly=${activeOnly}&page=${page}&limit=50`,
      { token },
    );
  } catch (loadError) {
    error = loadError;
  }

  const coupons = payload?.data ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promotions"
        title="Coupons"
        description="Create percentage or fixed-amount discount codes with usage rules."
      />

      <Card className="rounded-2xl shadow-none">
        <CardContent className="p-4">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            action="/admin/coupons"
          >
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search coupon code"
                className="pl-9"
              />
            </div>
            <label className="flex items-center gap-2 rounded-md border px-3 text-sm">
              <input
                type="checkbox"
                name="activeOnly"
                value="true"
                defaultChecked={activeOnly === "true"}
                className="size-4 rounded border-input"
              />
              Active only
            </label>
            <Button type="submit" variant="outline">
              Filter
            </Button>
            {q || activeOnly === "true" ? (
              <Button asChild variant="ghost">
                <Link href="/admin/coupons">Reset</Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>Coupons could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : (
        <CouponManager initialCoupons={coupons} />
      )}

      {!error ? (
        <AdminPagination
          meta={payload?.meta}
          basePath="/admin/coupons"
          params={{ q, activeOnly }}
        />
      ) : null}
    </div>
  );
}

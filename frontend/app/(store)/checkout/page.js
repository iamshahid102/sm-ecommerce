import { redirect } from "next/navigation";

import { CheckoutForm } from "@/components/store/checkout-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireCustomer } from "@/lib/auth/dal";

export const metadata = {
  title: "Checkout",
  description: "Complete your SM Store order with Cash on Delivery.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const { profile, supabase } = await requireCustomer("/checkout");
  const token = await getAccessToken(supabase);

  if (!token) {
    redirect("/login?next=/checkout");
  }

  let cart;
  let addresses;

  try {
    [cart, addresses] = await Promise.all([
      apiFetchServer("/cart", { token }),
      apiFetchServer("/addresses", { token }),
    ]);
  } catch (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertTitle>Checkout is unavailable</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!cart?.items?.length) {
    redirect("/cart");
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Secure checkout
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          Complete your order
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Confirm your delivery details and pay cash when the order arrives.
        </p>
      </div>

      <div className="mt-8">
        <CheckoutForm
          initialCart={cart}
          initialAddresses={addresses ?? []}
          profile={profile}
        />
      </div>
    </div>
  );
}

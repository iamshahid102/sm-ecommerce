import { AddressManager } from "@/components/account/address-manager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireCustomer } from "@/lib/auth/dal";

export const metadata = {
  title: "Saved addresses",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountAddressesPage() {
  const { supabase } = await requireCustomer("/account/addresses");
  const token = await getAccessToken(supabase);
  let addresses = [];
  let error = null;

  try {
    addresses = await apiFetchServer("/addresses", { token });
  } catch (loadError) {
    error = loadError;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Delivery
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          Saved addresses
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the addresses used at checkout.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Addresses could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : (
        <AddressManager initialAddresses={addresses} />
      )}
    </div>
  );
}

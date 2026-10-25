import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MenuManager } from "@/components/admin/menu-manager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";

export const metadata = {
  title: "Menu",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  let items = [];
  let error = null;

  try {
    items = await apiFetchServer("/admin/cms/menu", { token });
  } catch (loadError) {
    error = loadError;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Content"
        title="Navigation menu"
        description="Control the header and footer links shown around the storefront."
      />
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Menu could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : (
        <MenuManager initialItems={items} />
      )}
    </div>
  );
}

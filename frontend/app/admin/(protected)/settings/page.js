import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";

export const metadata = {
  title: "Store settings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  let settings = null;
  let error = null;

  try {
    settings = await apiFetchServer("/admin/settings", { token });
  } catch (loadError) {
    error = loadError;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Store settings"
        description="Control store identity, shipping, tax, contact details, and SEO defaults."
      />
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Settings could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : (
        <SettingsForm settings={settings} />
      )}
    </div>
  );
}

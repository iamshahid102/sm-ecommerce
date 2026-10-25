import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BannerManager } from "@/components/admin/banner-manager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";

export const metadata = {
  title: "Banners",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  let banners = [];
  let error = null;

  try {
    banners = await apiFetchServer("/admin/cms/banners", { token });
  } catch (loadError) {
    error = loadError;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Content"
        title="Banners"
        description="Manage hero and promotional banners on the homepage."
      />
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Banners could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : (
        <BannerManager initialBanners={banners} />
      )}
    </div>
  );
}

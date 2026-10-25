import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { HomeSectionManager } from "@/components/admin/home-section-manager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";

export const metadata = {
  title: "Home sections",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminHomeSectionsPage() {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  let sections = [];
  let error = null;

  try {
    sections = await apiFetchServer("/admin/cms/home-sections", { token });
  } catch (loadError) {
    error = loadError;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Content"
        title="Home sections"
        description="Control the order and visibility of homepage content blocks."
      />
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Home sections could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : (
        <HomeSectionManager initialSections={sections} />
      )}
    </div>
  );
}

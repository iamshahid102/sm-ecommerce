import { CmsPageForm } from "@/components/admin/cms-page-form";

export const metadata = {
  title: "Add CMS page",
  robots: { index: false, follow: false },
};

export default function AdminNewCmsPage() {
  return <CmsPageForm page={null} />;
}

import { ReviewManager } from "@/components/account/review-manager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireCustomer } from "@/lib/auth/dal";

export const metadata = {
  title: "My reviews",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountReviewsPage() {
  const { supabase } = await requireCustomer("/account/reviews");
  const token = await getAccessToken(supabase);
  let reviews = [];
  let error = null;

  try {
    reviews = await apiFetchServer("/reviews", { token });
  } catch (loadError) {
    error = loadError;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Feedback
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          My reviews
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit or remove the reviews you have submitted.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Reviews could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : (
        <ReviewManager initialReviews={reviews} />
      )}
    </div>
  );
}

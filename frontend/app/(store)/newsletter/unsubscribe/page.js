import { UnsubscribeForm } from "@/components/store/unsubscribe-form";

export const metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function NewsletterUnsubscribePage({ searchParams }) {
  const query = await searchParams;
  const token = Array.isArray(query.token) ? query.token[0] : query.token;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 text-center sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Unsubscribe
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We are sorry to see you go. Confirm below to stop receiving newsletter
        emails from SM Store.
      </p>
      <div className="mt-6">
        <UnsubscribeForm token={token} />
      </div>
    </div>
  );
}

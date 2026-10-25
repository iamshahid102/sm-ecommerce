"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailX } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { apiFetchPublic } from "@/lib/api/public";

export function UnsubscribeForm({ token }) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function unsubscribe() {
    setPending(true);
    setError("");
    try {
      await apiFetchPublic("/newsletter/unsubscribe", {
        method: "POST",
        body: { token },
      });
      setDone(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          This unsubscribe link is invalid. Please contact support if you
          continue to receive emails.
        </AlertDescription>
      </Alert>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <MailX className="mx-auto size-8 text-primary" aria-hidden="true" />
        <p className="mt-4 text-sm text-muted-foreground">
          You have been unsubscribed from store emails.
        </p>
        <Button asChild className="mt-4">
          <Link href="/">Return to the store</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="button" onClick={unsubscribe} disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Confirm unsubscribe
      </Button>
    </div>
  );
}

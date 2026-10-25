"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { apiFetchPublic } from "@/lib/api/public";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterForm({ source = "footer" }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();

    if (!email.trim()) return;

    setPending(true);
    try {
      const result = await apiFetchPublic("/newsletter", {
        method: "POST",
        body: { email: email.trim(), source },
      });
      toast.success(
        result?.already_subscribed
          ? "You are already subscribed."
          : "You are subscribed. Welcome to SM Store.",
      );
      setEmail("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Mail
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email address"
          className="bg-background pl-9"
          aria-label="Email address"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Subscribe
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Loader2, Mail, Send } from "lucide-react";
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
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email address"
          className="h-11 rounded-full border-white bg-white pr-4 pl-11 text-sm shadow-sm placeholder:text-slate-400 focus-visible:ring-primary/20"
          aria-label="Email address"
          required
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-11 rounded-full bg-slate-950 px-6 text-white shadow-sm hover:bg-primary"
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        {pending ? "Subscribing…" : "Subscribe"}
      </Button>
    </form>
  );
}

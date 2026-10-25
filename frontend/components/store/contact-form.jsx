"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetchPublic } from "@/lib/api/public";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export function ContactForm({ defaultName = "", defaultEmail = "" }) {
  const [values, setValues] = useState({
    ...EMPTY,
    name: defaultName,
    email: defaultEmail,
  });
  const [website, setWebsite] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setSent(false);

    try {
      await apiFetchPublic("/contact", {
        method: "POST",
        body: {
          ...values,
          phone: values.phone || undefined,
          website,
        },
      });
      setSent(true);
      setValues({ ...EMPTY, name: defaultName, email: defaultEmail });
      toast.success("Message sent. We will reply soon.");
    } catch (error) {
      const details = Array.isArray(error?.details)
        ? error.details.map((item) => item.message).join(" ")
        : "";
      toast.error(details || error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {sent ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <AlertDescription>
            Your message has been received. Our team usually replies within one
            working day.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            required
            minLength={2}
            maxLength={100}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="contact-phone">Phone (optional)</Label>
          <Input
            id="contact-phone"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="03001234567"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="contact-subject">Subject</Label>
          <Input
            id="contact-subject"
            value={values.subject}
            onChange={(event) => update("subject", event.target.value)}
            required
            minLength={3}
            maxLength={150}
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          className="mt-1.5"
        />
      </div>

      <div className="hidden" aria-hidden="true">
        <Label htmlFor="contact-website">Website</Label>
        <Input
          id="contact-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        Send message
      </Button>
    </form>
  );
}

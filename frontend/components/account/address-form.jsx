"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMPTY = {
  label: "Home",
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "PK",
  is_default: false,
};

export function AddressForm({
  initialValue,
  onSubmit,
  pending = false,
  submitLabel = "Save address",
  onCancel,
}) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValue });

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      ...values,
      address_line2: values.address_line2 || null,
      postal_code: values.postal_code || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="address-label">Label</Label>
          <Input
            id="address-label"
            value={values.label}
            onChange={(event) => update("label", event.target.value)}
            placeholder="Home, Office"
            required
            maxLength={40}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="address-name">Full name</Label>
          <Input
            id="address-name"
            value={values.full_name}
            onChange={(event) => update("full_name", event.target.value)}
            required
            minLength={2}
            maxLength={100}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="address-phone">Phone</Label>
          <Input
            id="address-phone"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="03001234567"
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="address-city">City</Label>
          <Input
            id="address-city"
            value={values.city}
            onChange={(event) => update("city", event.target.value)}
            required
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="address-line1">Address line 1</Label>
          <Input
            id="address-line1"
            value={values.address_line1}
            onChange={(event) => update("address_line1", event.target.value)}
            placeholder="House / street / area"
            required
            minLength={5}
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="address-line2">Address line 2 (optional)</Label>
          <Input
            id="address-line2"
            value={values.address_line2 ?? ""}
            onChange={(event) => update("address_line2", event.target.value)}
            placeholder="Landmark, apartment, etc."
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="address-state">Province / state</Label>
          <Input
            id="address-state"
            value={values.state}
            onChange={(event) => update("state", event.target.value)}
            placeholder="Punjab"
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="address-postal">Postal code (optional)</Label>
          <Input
            id="address-postal"
            value={values.postal_code ?? ""}
            onChange={(event) => update("postal_code", event.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(values.is_default)}
          onChange={(event) => update("is_default", event.target.checked)}
          className="size-4 rounded border-input"
        />
        Set as default delivery address
      </label>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function apiErrorMessage(error) {
  if (Array.isArray(error?.details) && error.details.length > 0) {
    return error.details.map((item) => item.message).join(" ");
  }
  return error?.message || "Something went wrong.";
}

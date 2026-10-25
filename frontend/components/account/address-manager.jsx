"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AddressForm, apiErrorMessage } from "@/components/account/address-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api/client";

export function AddressManager({ initialAddresses }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  function startAdd() {
    setEditing(null);
    setOpen(true);
  }

  function startEdit(address) {
    setEditing(address);
    setOpen(true);
  }

  async function saveAddress(values) {
    setPending(true);
    try {
      if (editing) {
        const updated = await apiFetch(`/addresses/${editing.id}`, {
          method: "PATCH",
          body: values,
        });
        setAddresses((current) =>
          current.map((address) => {
            if (address.id === updated.id) return updated;
            if (updated.is_default) return { ...address, is_default: false };
            return address;
          }),
        );
        toast.success("Address updated.");
      } else {
        const created = await apiFetch("/addresses", {
          method: "POST",
          body: values,
        });
        setAddresses((current) => [
          created,
          ...current.map((address) =>
            created.is_default ? { ...address, is_default: false } : address,
          ),
        ]);
        toast.success("Address added.");
      }
      setOpen(false);
      setEditing(null);
      router.refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setPending(false);
    }
  }

  async function setDefault(address) {
    setPending(true);
    try {
      const updated = await apiFetch(`/addresses/${address.id}`, {
        method: "PATCH",
        body: {
          label: address.label,
          full_name: address.full_name,
          phone: address.phone,
          address_line1: address.address_line1,
          address_line2: address.address_line2,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: address.country,
          is_default: true,
        },
      });
      setAddresses((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : { ...item, is_default: false },
        ),
      );
      toast.success("Default address updated.");
      router.refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setPending(false);
    }
  }

  async function remove(address) {
    if (!window.confirm("Delete this address?")) return;

    setPending(true);
    try {
      await apiFetch(`/addresses/${address.id}`, { method: "DELETE" });
      setAddresses((current) => current.filter((item) => item.id !== address.id));
      toast.success("Address deleted.");
      router.refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={startAdd}>
          <Plus className="size-4" aria-hidden="true" />
          Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-12 text-center shadow-none">
          <CardContent>
            <MapPin className="mx-auto size-8 text-primary" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-lg font-semibold">
              No saved addresses
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Add a delivery address now, or create one during checkout.
            </p>
            <Button type="button" className="mt-4" onClick={startAdd}>
              Add your first address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className="rounded-2xl shadow-none">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{address.label}</p>
                      {address.is_default ? (
                        <Badge variant="secondary">Default</Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-medium">{address.full_name}</p>
                    <p className="text-xs text-muted-foreground">{address.phone}</p>
                  </div>
                  <MapPin className="size-4 text-primary" aria-hidden="true" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {address.address_line1}
                  {address.address_line2 ? `, ${address.address_line2}` : ""}
                  <br />
                  {[address.city, address.state, address.postal_code]
                    .filter(Boolean)
                    .join(", ")}
                  <br />
                  {address.country}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(address)}
                    disabled={pending}
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit
                  </Button>
                  {!address.is_default ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setDefault(address)}
                      disabled={pending}
                    >
                      <Check className="size-3.5" aria-hidden="true" />
                      Set default
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(address)}
                    disabled={pending}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit address" : "Add address"}</DialogTitle>
            <DialogDescription>
              Delivery details are stored only for your account.
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            initialValue={editing ?? undefined}
            onSubmit={saveAddress}
            pending={pending}
            submitLabel={editing ? "Save changes" : "Add address"}
            onCancel={() => {
              setOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

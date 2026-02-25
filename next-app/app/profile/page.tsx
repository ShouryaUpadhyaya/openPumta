"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { GalleryVerticalEnd, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatarUrl: "",
  });

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/auth/user`,
      {
        credentials: "include",
      },
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
          setFormData({
            name: data.name || "",
            email: data.email || "",
            avatarUrl: data.avatarUrl || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/users/${user.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      if (res.ok) {
        const updated = await res.json();
        setUser(updated.data);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen overflow-hidden flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Not Authenticated</h1>
        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col items-center p-6 md:p-10">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted overflow-hidden border-2 border-primary">
            {formData.avatarUrl ? (
              <img
                src={formData.avatarUrl}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <GalleryVerticalEnd className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground text-sm">
            Update your personal information
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="space-y-6 bg-card p-6 rounded-xl shadow-sm border"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="avatarUrl">Avatar URL</FieldLabel>
              <Input
                id="avatarUrl"
                value={formData.avatarUrl}
                onChange={(e) =>
                  setFormData({ ...formData, avatarUrl: e.target.value })
                }
                placeholder="https://example.com/avatar.png"
                className="bg-background"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="name">Display Name</FieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Your Name"
                required
                className="bg-background"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email address</FieldLabel>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Email cannot be changed as it is linked to your Google account.
              </p>
            </Field>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </FieldGroup>
        </form>

        <div className="text-center pb-20">
          <Button variant="link" asChild>
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

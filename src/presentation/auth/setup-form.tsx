"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SetupForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const body = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(body.error ?? "Setup gagal. Coba lagi.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/login?setup=complete");
  }

  return (
    <form onSubmit={onSubmit}>
      {error ? <p className="notice error" role="alert">{error}</p> : null}
      <label htmlFor="email">Email<input id="email" name="email" type="email" autoComplete="email" required /></label>
      <label htmlFor="password">Password<input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Membuat akun…" : "Buat akun"}</button>
    </form>
  );
}

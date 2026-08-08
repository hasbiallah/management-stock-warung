import { redirect } from "next/navigation";

import { hasOwnerAccount } from "@/application/owner-account/has-owner-account";
import { PrismaOwnerAccountRepository } from "@/infrastructure/database/prisma-owner-account-repository";
import { SetupForm } from "@/presentation/auth/setup-form";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if (await hasOwnerAccount(new PrismaOwnerAccountRepository())) {
    redirect("/login");
  }

  return (
    <main>
      <section className="card" aria-labelledby="setup-title">
        <span className="eyebrow">First-Run Setup</span>
        <h1 id="setup-title">Buat akun Pemilik Warung</h1>
        <p>Akun ini hanya dibuat sekali dan memberi akses penuh ke aplikasi.</p>
        <SetupForm />
      </section>
    </main>
  );
}

import { redirect } from "next/navigation";

import { LoginForm } from "@/presentation/auth/login-form";
import { hasOwnerAccount } from "@/application/owner-account/has-owner-account";
import { PrismaOwnerAccountRepository } from "@/infrastructure/database/prisma-owner-account-repository";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { setup?: string };
}) {
  const repository = new PrismaOwnerAccountRepository();
  if (!(await hasOwnerAccount(repository))) {
    redirect("/setup");
  }

  return (
    <main>
      <section className="card" aria-labelledby="login-title">
        <span className="eyebrow">Manajemen Stok Warung</span>
        <h1 id="login-title">Masuk</h1>
        <p>Masuk untuk mengelola stok warung Anda.</p>
        {searchParams.setup === "complete" ? (
          <p className="notice success" role="status">Akun berhasil dibuat. Silakan masuk.</p>
        ) : null}
        <LoginForm />
      </section>
    </main>
  );
}

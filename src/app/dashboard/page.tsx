import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/auth";
import { LogoutButton } from "@/presentation/auth/logout-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="dashboard">
      <section className="card">
        <header>
          <div>
            <span className="eyebrow">Pemilik Warung</span>
            <h1>Dashboard</h1>
          </div>
          <LogoutButton />
        </header>
        <p>Anda masuk sebagai {session.user?.email}. Fitur manajemen Produk akan tampil di sini.</p>
      </section>
    </main>
  );
}

import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { ProductNotFoundError } from "@/application/stock-movement/list-riwayat-stok";
import { authOptions } from "@/app/auth";
import { catalogueUseCases } from "@/presentation/catalogue/use-cases";
import { RiwayatStokList } from "@/presentation/stock-movement/riwayat-stok-list";

export const dynamic = "force-dynamic";

type PageProps = { params: { id: string } };

export default async function HistoryPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  try {
    const entries = await catalogueUseCases.listRiwayatStok({ productId: params.id });

    return (
      <main className="dashboard">
        <section className="card">
          <header>
            <div>
              <span className="eyebrow">Riwayat Stok</span>
              <h1>Gerakan Stok per Produk</h1>
            </div>
            <a className="muted-link" href="/dashboard">← Kembali ke Katalog</a>
          </header>
          <RiwayatStokList entries={entries} productId={params.id} />
        </section>
      </main>
    );
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      redirect("/dashboard");
    }
    throw error;
  }
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/auth";
import { LogoutButton } from "@/presentation/auth/logout-button";
import { ProductCatalogue } from "@/presentation/product/product-catalogue";
import { PrismaProductRepository } from "@/infrastructure/database/prisma-product-repository";
import { PrismaStockMovementRepository } from "@/infrastructure/database/prisma-stock-movement-repository";
import { listActiveProducts } from "@/application/product/manage-product-catalogue";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const productsRepo = new PrismaProductRepository();
  const movements = new PrismaStockMovementRepository();
  const products = await listActiveProducts({}, { products: productsRepo, movements });

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
        <p>Anda masuk sebagai {session.user?.email}.</p>
        <ProductCatalogue initialProducts={products} />
      </section>
    </main>
  );
}

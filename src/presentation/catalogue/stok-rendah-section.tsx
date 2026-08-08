"use client";

import type { CatalogueProduct } from "@/application/product/manage-product-catalogue";

export function StokRendahSection({ products }: { products: readonly CatalogueProduct[] }) {
  const lowStockProducts = products.filter((product) => product.isLowStock);

  return (
    <section className="low-stock-section" aria-labelledby="low-stock-title">
      <div className="catalogue-heading">
        <div>
          <span className="eyebrow">Stok Rendah</span>
          <h2 id="low-stock-title">Produk yang perlu direstock</h2>
          <p>Produk dengan Stok di bawah Stok Minimum masing-masing.</p>
        </div>
      </div>
      {lowStockProducts.length === 0 ? (
        <p className="empty-state">Tidak ada Produk dalam kondisi Stok Rendah.</p>
      ) : (
        <ul className="low-stock-list">
          {lowStockProducts.map((product) => (
            <li key={product.id}>
              <span><strong>{product.name}</strong> ({product.unit})</span>
              <span><strong>{product.stock}</strong> / Stok Minimum {product.minimumStock}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import type { CatalogueProduct } from "@/application/product/manage-product-catalogue";
import { OpnameForm } from "@/presentation/stock-movement/opname-form";
import { StockMovementForm } from "@/presentation/stock-movement/stock-movement-form";

type ProductDraft = {
  name: string;
  unit: string;
  sellingPrice: string;
  minimumStock: string;
};

const emptyDraft: ProductDraft = { name: "", unit: "", sellingPrice: "", minimumStock: "" };

function toDraft(product: CatalogueProduct): ProductDraft {
  return {
    name: product.name,
    unit: product.unit,
    sellingPrice: String(product.sellingPrice),
    minimumStock: String(product.minimumStock),
  };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
}

export function ProductCatalogue({ initialProducts }: { initialProducts: CatalogueProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [editing, setEditing] = useState<CatalogueProduct>();
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  async function loadProducts(nextQuery = query) {
    const response = await fetch(`/api/products?query=${encodeURIComponent(nextQuery)}`);

    if (response.ok) {
      setProducts((await response.json()) as CatalogueProduct[]);
    }
  }

  function resetForm() {
    setDraft(emptyDraft);
    setEditing(undefined);
    setError(undefined);
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setIsSaving(true);

    const response = await fetch(editing ? `/api/products/${editing.id}` : "/api/products", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        unit: draft.unit,
        sellingPrice: Number(draft.sellingPrice),
        minimumStock: Number(draft.minimumStock),
      }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(body.error ?? "Produk tidak dapat disimpan. Coba lagi.");
      setIsSaving(false);
      return;
    }

    resetForm();
    await loadProducts();
    setIsSaving(false);
  }

  async function deactivate(product: CatalogueProduct) {
    if (!window.confirm(`Nonaktifkan ${product.name}? Riwayat Stoknya tetap tersimpan.`)) {
      return;
    }

    const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });

    if (!response.ok) {
      setError("Produk tidak dapat dinonaktifkan. Coba lagi.");
      return;
    }

    await loadProducts();
  }

  return (
    <>
      <section className="low-stock-section" aria-labelledby="low-stock-title">
        <div className="catalogue-heading">
          <div>
            <span className="eyebrow">Stok Rendah</span>
            <h2 id="low-stock-title">Produk yang perlu direstock</h2>
            <p>Produk dengan Stok di bawah Stok Minimum masing-masing.</p>
          </div>
        </div>
        {(() => {
          const lowStockProducts = products.filter((product) => product.isLowStock);
          if (lowStockProducts.length === 0) {
            return <p className="empty-state">Tidak ada Produk dalam kondisi Stok Rendah.</p>;
          }
          return (
            <ul className="low-stock-list">
              {lowStockProducts.map((product) => (
                <li key={product.id}>
                  <span><strong>{product.name}</strong> ({product.unit})</span>
                  <span><strong>{product.stock}</strong> / Stok Minimum {product.minimumStock}</span>
                </li>
              ))}
            </ul>
          );
        })()}
      </section>
      <StockMovementForm products={products} movementType="MASUK" onRecorded={loadProducts} />
      <StockMovementForm products={products} movementType="KELUAR" onRecorded={loadProducts} />
      <OpnameForm products={products} onRecorded={loadProducts} />
      <section className="catalogue" aria-labelledby="products-title">
        <div className="catalogue-heading">
          <div>
            <span className="eyebrow">Katalog</span>
            <h2 id="products-title">Produk aktif</h2>
            <p>Stok dihitung dari semua Gerakan Stok yang tercatat.</p>
          </div>
          <button type="button" onClick={resetForm}>Tambah Produk</button>
        </div>

        <form className="product-form" onSubmit={submitProduct} aria-label={editing ? "Ubah Produk" : "Tambah Produk"}>
        <h3>{editing ? `Ubah ${editing.name}` : "Tambah Produk"}</h3>
        {error ? <p className="notice error" role="alert">{error}</p> : null}
        <label htmlFor="product-name">Nama Produk<input id="product-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></label>
        <label htmlFor="product-unit">Satuan<input id="product-unit" value={draft.unit} onChange={(event) => setDraft({ ...draft, unit: event.target.value })} required placeholder="contoh: pcs, kg, liter" /></label>
        <label htmlFor="product-price">Harga jual<input id="product-price" type="number" min="0" step="1" value={draft.sellingPrice} onChange={(event) => setDraft({ ...draft, sellingPrice: event.target.value })} required /></label>
        <label htmlFor="product-minimum-stock">Stok Minimum<input id="product-minimum-stock" type="number" min="0" step="1" value={draft.minimumStock} onChange={(event) => setDraft({ ...draft, minimumStock: event.target.value })} required /></label>
        <div className="form-actions">
          {editing ? <button type="button" className="secondary" onClick={resetForm}>Batal</button> : null}
          <button type="submit" disabled={isSaving}>{isSaving ? "Menyimpan…" : editing ? "Simpan perubahan" : "Simpan Produk"}</button>
        </div>
        </form>

        <label className="search" htmlFor="product-search">Cari Produk<input id="product-search" type="search" value={query} onChange={(event) => { const nextQuery = event.target.value; setQuery(nextQuery); void loadProducts(nextQuery); }} placeholder="Ketik nama Produk" /></label>

        {products.length === 0 ? (
        <p className="empty-state">Belum ada Produk aktif yang sesuai.</p>
      ) : (
        <div className="product-table-wrap">
          <table>
            <thead><tr><th>Produk</th><th>Harga jual</th><th>Stok</th><th>Aksi</th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td><strong>{product.name}</strong><span>{product.unit} · Stok Minimum {product.minimumStock}</span></td>
                  <td>{formatPrice(product.sellingPrice)}</td>
                  <td><strong>{product.stock} {product.unit}</strong>{product.isLowStock ? <span className="low-stock">Stok Rendah</span> : null}</td>
                  <td className="row-actions"><Link className="muted-link" href={`/dashboard/products/${product.id}/history`}>Riwayat</Link><button type="button" className="secondary" onClick={() => { setEditing(product); setDraft(toDraft(product)); setError(undefined); }}>Ubah</button><button type="button" className="danger" onClick={() => void deactivate(product)}>Nonaktifkan</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </section>
    </>
  );
}

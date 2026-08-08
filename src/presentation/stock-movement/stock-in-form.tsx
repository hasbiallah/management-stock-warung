"use client";

import { FormEvent, useState } from "react";

import type { CatalogueProduct } from "@/application/product/manage-product-catalogue";

type StockInFormProps = {
  products: CatalogueProduct[];
  onRecorded(): Promise<void>;
};

export function StockInForm({ products, onRecorded }: StockInFormProps) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  async function submitStockIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    setIsSaving(true);

    const response = await fetch("/api/stock-movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: Number(quantity) }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string; stock?: number };

    if (!response.ok) {
      setError(body.error ?? "Stok Masuk tidak dapat dicatat. Coba lagi.");
      setIsSaving(false);
      return;
    }

    const product = products.find((candidate) => candidate.id === productId);
    setSuccess(`Stok Masuk ${product?.name ?? "Produk"} dicatat. Stok saat ini: ${body.stock ?? 0}.`);
    setQuantity("");
    await onRecorded();
    setIsSaving(false);
  }

  return (
    <section className="stock-in" aria-labelledby="stock-in-title">
      <div>
        <span className="eyebrow">Stok</span>
        <h2 id="stock-in-title">Catat Stok Masuk</h2>
      </div>
      <form className="stock-in-form" onSubmit={submitStockIn}>
        {error ? <p className="notice error" role="alert">{error}</p> : null}
        {success ? <p className="notice success" role="status">{success}</p> : null}
        <label htmlFor="stock-in-product">Produk aktif<select id="stock-in-product" value={productId} onChange={(event) => setProductId(event.target.value)} required><option value="" disabled>Pilih Produk</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.unit})</option>)}</select></label>
        <label htmlFor="stock-in-quantity">Jumlah unit<input id="stock-in-quantity" type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>
        <button type="submit" disabled={isSaving || products.length === 0}>{isSaving ? "Mencatat…" : "Catat Stok Masuk"}</button>
      </form>
      {products.length === 0 ? <p className="empty-state">Tambahkan Produk aktif terlebih dahulu.</p> : null}
    </section>
  );
}

"use client";

import { FormEvent, useState } from "react";

import type { CatalogueProduct } from "@/application/product/manage-product-catalogue";

type StockMovementFormProps = {
  products: CatalogueProduct[];
  movementType: "MASUK" | "KELUAR";
  onRecorded(): Promise<void>;
};

const movementLabels = {
  MASUK: "Stok Masuk",
  KELUAR: "Stok Keluar",
} as const;

export function StockMovementForm({ products, movementType, onRecorded }: StockMovementFormProps) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const label = movementLabels[movementType];
  const id = movementType.toLowerCase();
  const endpoint = movementType === "MASUK" ? "/api/stock-movements" : "/api/stock-movements/out";

  async function submitMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    setIsSaving(true);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: Number(quantity) }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string; stock?: number };

    if (!response.ok) {
      setError(body.error ?? `${label} tidak dapat dicatat. Coba lagi.`);
      setIsSaving(false);
      return;
    }

    const product = products.find((candidate) => candidate.id === productId);
    setSuccess(`${label} ${product?.name ?? "Produk"} dicatat. Stok saat ini: ${body.stock ?? 0}.`);
    setQuantity("");
    await onRecorded();
    setIsSaving(false);
  }

  return (
    <section className="stock-movement" aria-labelledby={`${id}-title`}>
      <div>
        <span className="eyebrow">Stok</span>
        <h2 id={`${id}-title`}>Catat {label}</h2>
      </div>
      <form className="stock-movement-form" onSubmit={submitMovement}>
        {error ? <p className="notice error" role="alert">{error}</p> : null}
        {success ? <p className="notice success" role="status">{success}</p> : null}
        <label htmlFor={`${id}-product`}>Produk aktif<select id={`${id}-product`} value={productId} onChange={(event) => setProductId(event.target.value)} required><option value="" disabled>Pilih Produk</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.unit})</option>)}</select></label>
        <label htmlFor={`${id}-quantity`}>Jumlah unit<input id={`${id}-quantity`} type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>
        <button type="submit" disabled={isSaving || products.length === 0}>{isSaving ? "Mencatat…" : `Catat ${label}`}</button>
      </form>
      {products.length === 0 ? <p className="empty-state">Tambahkan Produk aktif terlebih dahulu.</p> : null}
    </section>
  );
}

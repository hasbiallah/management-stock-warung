"use client";

import { FormEvent, useState } from "react";

import type { CatalogueProduct } from "@/application/product/manage-product-catalogue";
import { useStockDifference } from "./use-stock-difference";

type OpnameFormProps = {
  products: CatalogueProduct[];
  onRecorded(): Promise<void>;
};

export function OpnameForm({ products, onRecorded }: OpnameFormProps) {
  const [productId, setProductId] = useState("");
  const [quantityAfter, setQuantityAfter] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const selectedProduct = products.find((p) => p.id === productId);
  const currentStock = selectedProduct?.stock ?? 0;
  const newStock = quantityAfter ? Number(quantityAfter) : 0;
  const { difference, differenceLabel, isDecrease, isIncrease } = useStockDifference(currentStock, newStock);

  function handlePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);

    if (!productId || !quantityAfter || !reason.trim()) {
      setError("Lengkapi semua field sebelum melihat pratinjau.");
      return;
    }

    setShowPreview(true);
  }

  async function submitOpname() {
    setError(undefined);
    setSuccess(undefined);
    setIsSaving(true);

    const response = await fetch("/api/stock-movements/opname", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantityAfter: Number(quantityAfter),
        reason: reason.trim(),
      }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string; stock?: number };

    if (!response.ok) {
      setError(body.error ?? "Opname tidak dapat dicatat. Coba lagi.");
      setIsSaving(false);
      setShowPreview(false);
      return;
    }

    setSuccess(`Opname ${selectedProduct?.name ?? "Produk"} dicatat. Stok saat ini: ${body.stock ?? 0}.`);
    setProductId("");
    setQuantityAfter("");
    setReason("");
    setShowPreview(false);
    await onRecorded();
    setIsSaving(false);
  }

  function cancelPreview() {
    setShowPreview(false);
  }

  return (
    <section className="stock-movement" aria-labelledby="opname-title">
      <div>
        <span className="eyebrow">Stok</span>
        <h2 id="opname-title">Lakukan Opname</h2>
      </div>

      {!showPreview ? (
        <form className="stock-movement-form" onSubmit={handlePreview}>
          {error ? (
            <p className="notice error" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="notice success" role="status">
              {success}
            </p>
          ) : null}
          <label htmlFor="opname-product">
            Produk aktif
            <select
              id="opname-product"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              required
            >
              <option value="" disabled>
                Pilih Produk
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.unit}) — Stok saat ini: {product.stock}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="opname-quantity">
            Hasil hitung fisik (unit)
            <input
              id="opname-quantity"
              type="number"
              min="0"
              step="1"
              value={quantityAfter}
              onChange={(event) => setQuantityAfter(event.target.value)}
              required
            />
          </label>
          <label htmlFor="opname-reason">
            Alasan (wajib diisi)
            <textarea
              id="opname-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Contoh: Hitung fisik bulanan, ada barang rusak, koreksi stok"
              rows={3}
              required
            />
          </label>
          <button type="submit" disabled={products.length === 0}>
            Pratinjau Opname
          </button>
        </form>
      ) : (
        <div className="opname-preview">
          <div className="preview-box">
            <h3>Pratinjau Opname</h3>
            <dl className="preview-details">
              <dt>Produk:</dt>
              <dd>{selectedProduct?.name} ({selectedProduct?.unit})</dd>
              
              <dt>Stok sistem saat ini:</dt>
              <dd>{currentStock}</dd>
              
              <dt>Hasil hitung fisik:</dt>
              <dd>{newStock}</dd>
              
              <dt>Selisih:</dt>
              <dd className={isDecrease ? "negative" : isIncrease ? "positive" : ""}>
                {differenceLabel}
              </dd>
              
              <dt>Alasan:</dt>
              <dd>{reason}</dd>
            </dl>
          </div>
          {error ? (
            <p className="notice error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="preview-actions">
            <button type="button" onClick={cancelPreview} disabled={isSaving}>
              Batal
            </button>
            <button type="button" onClick={submitOpname} disabled={isSaving} className="primary">
              {isSaving ? "Menyimpan…" : "Konfirmasi & Simpan Opname"}
            </button>
          </div>
        </div>
      )}

      {products.length === 0 && !showPreview ? (
        <p className="empty-state">Tambahkan Produk aktif terlebih dahulu.</p>
      ) : null}
    </section>
  );
}

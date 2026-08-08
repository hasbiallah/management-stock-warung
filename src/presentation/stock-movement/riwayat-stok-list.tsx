"use client";

import Link from "next/link";

export type RiwayatStokEntry = {
  occurredAt: string;
  type: "MASUK" | "KELUAR" | "OPNAME";
  quantity: number;
  reason: string | null;
  stockAfter: number;
};

const typeLabels: Record<RiwayatStokEntry["type"], string> = {
  MASUK: "Stok Masuk",
  KELUAR: "Stok Keluar",
  OPNAME: "Opname",
};

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function RiwayatStokList({
  entries,
  productId,
}: {
  entries: RiwayatStokEntry[];
  productId: string;
}) {
  if (entries.length === 0) {
    return <p className="empty-state">Belum ada Gerakan Stok untuk Produk ini.</p>;
  }

  return (
    <>
      <p>
        <Link href={`/api/stock-movements/history?productId=${encodeURIComponent(productId)}&format=csv`}>
          Unduh sebagai CSV
        </Link>
      </p>
      <div className="product-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Tipe</th>
              <th>Jumlah</th>
              <th>Alasan Opname</th>
              <th>Stok setelah gerakan</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={`${entry.occurredAt}-${index}`}>
                <td>{formatDateTime(entry.occurredAt)}</td>
                <td>{typeLabels[entry.type]}</td>
                <td>{entry.quantity}</td>
                <td>{entry.reason ?? ""}</td>
                <td><strong>{entry.stockAfter}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

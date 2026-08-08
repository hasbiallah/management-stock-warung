import { z } from "zod";

export const stockOutInputSchema = z.object({
  productId: z.string().min(1, "Pilih Produk aktif."),
  quantity: z.number().int().positive("Jumlah Stok Keluar harus lebih dari nol."),
});

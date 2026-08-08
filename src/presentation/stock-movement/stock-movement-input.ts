import { z } from "zod";

export const stockInInputSchema = z.object({
  productId: z.string().min(1, "Pilih Produk aktif."),
  quantity: z.number().int().positive("Jumlah Stok Masuk harus lebih dari nol."),
});

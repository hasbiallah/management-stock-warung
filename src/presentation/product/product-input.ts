import { z } from "zod";

export const productInputSchema = z.object({
  name: z.string().trim().min(1, "Nama Produk wajib diisi."),
  unit: z.string().trim().min(1, "Satuan wajib diisi."),
  sellingPrice: z.number().finite().nonnegative("Harga jual tidak boleh negatif."),
  minimumStock: z.number().int().nonnegative("Stok Minimum tidak boleh negatif."),
});

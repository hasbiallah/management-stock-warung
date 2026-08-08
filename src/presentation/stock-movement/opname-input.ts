import { z } from "zod";

export const opnameInputSchema = z.object({
  productId: z.string().min(1, "Pilih Produk aktif."),
  quantityAfter: z
    .number()
    .int("Jumlah stok harus berupa bilangan bulat.")
    .nonnegative("Jumlah stok tidak boleh negatif."),
  reason: z
    .string()
    .min(1, "Alasan Opname wajib diisi.")
    .refine((value) => value.trim().length > 0, "Alasan Opname tidak boleh hanya berisi spasi."),
});

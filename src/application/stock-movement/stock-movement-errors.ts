export class InactiveProductError extends Error {
  constructor() {
    super("Produk aktif tidak ditemukan.");
  }
}

export class InvalidStockInQuantityError extends Error {
  constructor() {
    super("Jumlah Stok Masuk harus berupa bilangan bulat lebih dari nol.");
  }
}

export class InvalidStockOutQuantityError extends Error {
  constructor() {
    super("Jumlah Stok Keluar harus berupa bilangan bulat lebih dari nol.");
  }
}

export class InsufficientStockError extends Error {
  constructor() {
    super("Stok tersedia tidak mencukupi.");
  }
}

export class InvalidOpnameQuantityError extends Error {
  constructor() {
    super("Jumlah stok hasil hitung fisik harus berupa bilangan bulat tidak negatif.");
  }
}

export class EmptyReasonError extends Error {
  constructor() {
    super("Alasan Opname wajib diisi.");
  }
}

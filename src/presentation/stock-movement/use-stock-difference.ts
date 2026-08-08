export function useStockDifference(currentStock: number, newStock: number) {
  const difference = newStock - currentStock;
  const differenceLabel =
    difference > 0
      ? `+${difference}`
      : difference < 0
        ? String(difference)
        : "0 (tidak ada perubahan)";

  return {
    difference,
    differenceLabel,
    isIncrease: difference > 0,
    isDecrease: difference < 0,
    isUnchanged: difference === 0,
  };
}

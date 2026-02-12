export function round(value: number | undefined | null, decimals = 0) {
  const safe = typeof value === "number" ? value : 0;
  return Number(safe.toFixed(decimals));
}


export function formatCurrency(
  value: number,
  currency = "THB"
): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("th-TH").format(value);
}

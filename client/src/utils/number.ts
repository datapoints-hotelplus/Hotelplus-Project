export function round(value: number, decimals = 2): number {
  return Number(value.toFixed(decimals));
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

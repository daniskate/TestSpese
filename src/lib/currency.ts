const eurFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatEUR(amount: number): string {
  return eurFormatter.format(amount);
}

export function splitEqual(amount: number, count: number): number[] {
  const cents = Math.round(amount * 100);
  const base = Math.floor(cents / count);
  const remainder = cents % count;
  return Array.from(
    { length: count },
    (_, i) => (base + (i < remainder ? 1 : 0)) / 100
  );
}

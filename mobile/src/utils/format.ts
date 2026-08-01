export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatCurrency(amount: number | string, currency: string): string {
  const value = typeof amount === 'number' ? amount : Number(amount);
  const prefix = currency ? `${currency} ` : '';
  return `${prefix}${value.toFixed(2)}`;
}

export function formatGreetingTime(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export const CURRENCIES = ['VND', 'USD', 'EUR'] as const;

export type Currency = typeof CURRENCIES[number];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  VND: '₫',
  USD: '$',
  EUR: '€',
};

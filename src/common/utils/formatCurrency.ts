import { CURRENCY_SYMBOLS } from '../../constants/currencies';

/** Formats a numeric amount with the correct decimal places and currency symbol. */
export const formatCurrency = (amount: number, currency: string): string => {
  const decimals = currency === 'VND' ? 0 : 2;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${formatted} ${symbol}`;
};

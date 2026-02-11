export const CURRENCY_SYMBOLS = { EUR: '\u20ac', GBP: '\u00a3', USD: '$' };

export function cs(currency) {
  return CURRENCY_SYMBOLS[currency] || currency + ' ';
}

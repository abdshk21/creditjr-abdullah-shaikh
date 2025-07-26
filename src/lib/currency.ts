export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham (د.إ)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Renminbi (¥)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
];

export const formatCurrency = (amount: number): string => {
  const selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is invalid
    const currency = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
};

export const getSelectedCurrency = (): Currency => {
  const selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
  return CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];
};

export const setSelectedCurrency = (currencyCode: string): void => {
  localStorage.setItem('selectedCurrency', currencyCode);
};
import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

const SUPPORTED_CURRENCIES = [
  { code: 'VND', symbol: '₫', locale: 'vi-VN', rate: 1 },
  { code: 'USD', symbol: '$', locale: 'en-US', rate: 0.00004 }, // Tỷ giá mẫu, sẽ cập nhật động sau
];

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('VND');
  const [rates] = useState({ VND: 1, USD: 0.00004 });

  useEffect(() => {
    // TODO: Gọi API lấy tỷ giá động nếu muốn
    // fetchRates().then(setRates)
  }, []);

  const formatCurrency = (amount) => {
    const cur = SUPPORTED_CURRENCIES.find(c => c.code === currency) || SUPPORTED_CURRENCIES[0];
    const value = amount * (rates[currency] || 1);
    return value.toLocaleString(cur.locale, { style: 'currency', currency: cur.code, maximumFractionDigits: cur.code === 'VND' ? 0 : 2 });
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, SUPPORTED_CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext); 
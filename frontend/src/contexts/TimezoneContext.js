import React, { createContext, useContext, useState } from 'react';

const TimezoneContext = createContext();

const SUPPORTED_TIMEZONES = [
  { tz: 'Asia/Ho_Chi_Minh', label: 'GMT+7 (Vietnam)' },
  { tz: 'Asia/Bangkok', label: 'GMT+7 (Bangkok)' },
  { tz: 'Asia/Tokyo', label: 'GMT+9 (Tokyo)' },
  { tz: 'America/New_York', label: 'GMT-4 (New York)' },
  { tz: 'Europe/London', label: 'GMT+0 (London)' },
  { tz: 'UTC', label: 'UTC' },
];

export const TimezoneProvider = ({ children }) => {
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');

  const formatDateTime = (date, options = {}) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-US', { timeZone: timezone, ...options });
  };

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone, formatDateTime, SUPPORTED_TIMEZONES }}>
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezone = () => useContext(TimezoneContext); 
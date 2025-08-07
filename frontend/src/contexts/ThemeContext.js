import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const defaultTheme = {
  mode: 'light', // 'light' | 'dark'
  primaryColor: '#1976d2',
  font: 'Roboto, Arial, sans-serif',
  layout: 'comfortable' // 'comfortable' | 'compact'
};

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const saved = localStorage.getItem('theme');
    if (!saved) return defaultTheme;
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.mode) {
        return parsed;
      } else if (typeof parsed === 'string') {
        // Nếu là chuỗi cũ: 'light' hoặc 'dark'
        return { ...defaultTheme, mode: parsed };
      }
    } catch {
      // Nếu lỗi parse, fallback về default hoặc chuỗi cũ
      if (saved === 'light' || saved === 'dark') {
        return { ...defaultTheme, mode: saved };
      }
    }
    return defaultTheme;
  };

  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
    document.body.setAttribute('data-theme', theme.mode);
    document.body.style.setProperty('--primary-color', theme.primaryColor);
    document.body.style.fontFamily = theme.font;
    document.body.setAttribute('data-layout', theme.layout);
  }, [theme]);

  const setTheme = (mode) => setThemeState(t => ({ ...t, mode }));
  const setPrimaryColor = (color) => setThemeState(t => ({ ...t, primaryColor: color }));
  const setFont = (font) => setThemeState(t => ({ ...t, font }));
  const setLayout = (layout) => setThemeState(t => ({ ...t, layout }));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, setPrimaryColor, setFont, setLayout }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 
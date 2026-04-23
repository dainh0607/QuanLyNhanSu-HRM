import React, { createContext, useContext, useState } from 'react';

interface SettingsContextType {
  dateFormat: string;
  timeFormat: string;
  setFormats: (date: string, time: string) => void;
  formatDate: (date: Date | string | number) => string;
  formatDateTime: (date: Date | string | number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dateFormat, setDateFormat] = useState<string>(() => {
    return localStorage.getItem('app_date_format') || 'DD/MM/YYYY';
  });

  const [timeFormat, setTimeFormat] = useState<string>(() => {
    return localStorage.getItem('app_time_format') || '24h';
  });

  const setFormats = (date: string, time: string) => {
    setDateFormat(date);
    setTimeFormat(time);
    localStorage.setItem('app_date_format', date);
    localStorage.setItem('app_time_format', time);
  };

  const formatDate = (date: Date | string | number) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    switch (dateFormat) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
      default:
        return `${day}/${month}/${year}`;
    }
  };

  const formatDateTime = (date: Date | string | number) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const datePart = formatDate(d);
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    if (timeFormat === '12h') {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      return `${datePart} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    } else {
      return `${datePart} ${String(hours).padStart(2, '0')}:${minutes}`;
    }
  };

  return (
    <SettingsContext.Provider value={{ dateFormat, timeFormat, setFormats, formatDate, formatDateTime }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

import React, { createContext, useState, useContext } from 'react';

// Define translations for different languages
const translations = {
  en: {
    "Settings": "Settings",
    "Email Notifications": "Email Notifications",
    "Dark Mode": "Dark Mode",
    "Language": "Language",
    "Save Settings": "Save Settings"
  },
  de: {
    "Settings": "Einstellungen",
    "Email Notifications": "E-Mail Benachrichtigungen",
    "Dark Mode": "Dunkelmodus",
    "Language": "Sprache",
    "Save Settings": "Einstellungen speichern"
  },
  fr: {
    "Settings": "Paramètres",
    "Email Notifications": "Notifications par email",
    "Dark Mode": "Mode sombre",
    "Language": "Langue",
    "Save Settings": "Enregistrer les paramètres"
  }
};

// Create the context
const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // default language is English

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
  };

  const getTranslation = (key) => {
    return translations[language][key] || key; // fallback to key if translation is missing
  };

  return (
    <LanguageContext.Provider value={{ changeLanguage, getTranslation }}>
      {children}
    </LanguageContext.Provider>
  );
};

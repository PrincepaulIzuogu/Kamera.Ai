import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext'; // Import useLanguage
import '../styles/Settings.css';

const Settings = () => {
  const { changeLanguage, getTranslation } = useLanguage(); // Get translations and changeLanguage function
  const [settings, setSettings] = useState(() => {
    const savedSettings = JSON.parse(localStorage.getItem('settings'));
    return savedSettings || {
      emailNotifications: true,
      darkMode: false,
      language: 'en',
    };
  });

  useEffect(() => {
    if (settings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [settings.darkMode]);

  const handleToggle = (e) => {
    const { name, checked } = e.target;
    const newSettings = { ...settings, [name]: checked };
    setSettings(newSettings);
    localStorage.setItem('settings', JSON.stringify(newSettings));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newSettings = { ...settings, [name]: value };
    setSettings(newSettings);
    localStorage.setItem('settings', JSON.stringify(newSettings));

    // Change the language globally
    if (name === 'language') {
      changeLanguage(value);
    }
  };

  return (
    <div className="settings-container">
      <h1>{getTranslation('Settings')}</h1>
      <form className="settings-form">
        <div className="settings-item">
          <label className="settings-label">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleToggle}
              className="settings-checkbox"
            />
            <span>{getTranslation('Email Notifications')}</span>
          </label>
        </div>

        <div className="settings-item">
          <label className="settings-label">
            <input
              type="checkbox"
              name="darkMode"
              checked={settings.darkMode}
              onChange={handleToggle}
              className="settings-checkbox"
            />
            <span>{getTranslation('Dark Mode')}</span>
          </label>
        </div>

        <div className="settings-item">
          <label className="settings-label" htmlFor="language">
            {getTranslation('Language')}
          </label>
          <select
            name="language"
            value={settings.language}
            onChange={handleChange}
            id="language"
            className="settings-select"
          >
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div className="settings-item">
          <button
            type="button"
            className="settings-btn"
            onClick={() => alert(getTranslation('Settings Saved!'))}
          >
            {getTranslation('Save Settings')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

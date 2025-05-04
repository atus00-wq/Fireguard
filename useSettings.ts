import { useState, useEffect } from 'react';

interface Settings {
  aiActive: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  notificationsEnabled: boolean;
  locationEnabled: boolean;
}

export default function useSettings() {
  // Initialize with default settings
  const [settings, setSettings] = useState<Settings>({
    aiActive: true,
    sensitivity: 'medium',
    notificationsEnabled: true,
    locationEnabled: true,
  });

  // Load settings from localStorage on first render
  useEffect(() => {
    const savedSettings = localStorage.getItem('fireGuardSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('fireGuardSettings', JSON.stringify(settings));
  }, [settings]);

  // Toggle AI active state
  const toggleAI = () => {
    setSettings(prev => ({
      ...prev,
      aiActive: !prev.aiActive,
    }));
  };

  // Set detection sensitivity
  const setSensitivity = (value: string) => {
    setSettings(prev => ({
      ...prev,
      sensitivity: value as 'low' | 'medium' | 'high',
    }));
  };

  // Toggle notifications
  const toggleNotifications = () => {
    setSettings(prev => ({
      ...prev,
      notificationsEnabled: !prev.notificationsEnabled,
    }));
  };

  // Toggle location tracking
  const toggleLocation = () => {
    setSettings(prev => ({
      ...prev,
      locationEnabled: !prev.locationEnabled,
    }));
  };

  return {
    settings,
    aiActive: settings.aiActive,
    sensitivity: settings.sensitivity,
    notificationsEnabled: settings.notificationsEnabled,
    locationEnabled: settings.locationEnabled,
    toggleAI,
    setSensitivity,
    toggleNotifications,
    toggleLocation,
  };
}

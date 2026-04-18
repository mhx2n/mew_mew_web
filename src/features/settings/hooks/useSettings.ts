import { useState, useEffect } from 'react';
import { TelegramSettings } from '../../../types';
import { useAuth } from '../../auth/hooks/useAuth';
import { fetchSettings, saveSettings as saveSettingsToBackend } from '../services/settingsService';

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<TelegramSettings>({ 
    botToken: '', 
    channels: [],
    activeChannelId: '',
    questionPrefix: '',
    prefixes: [],
    suffixes: []
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        // Load from Firestore
        try {
          const data = await fetchSettings(user.uid);
          if (data) {
            setSettings(data);
          } else {
            // If no settings in Firestore, check local storage and migrate
            loadFromLocalAndMigrate();
          }
        } catch (error) {
          console.error("Error loading settings from Firestore", error);
          loadFromLocalAndMigrate();
        }
      } else {
        // Load from Local Storage
        loadFromLocalAndMigrate();
      }
    };

    const loadFromLocalAndMigrate = () => {
      const savedSettings = localStorage.getItem('telegramQuizSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          
          // Migration from legacy chatId to channels
          if (parsed.chatId && (!parsed.channels || parsed.channels.length === 0)) {
            parsed.channels = [{ id: parsed.chatId, name: parsed.chatId, type: 'channel' }];
            parsed.activeChannelId = parsed.chatId;
            delete parsed.chatId;
          }
          
          if (!parsed.channels) parsed.channels = [];
          if (!parsed.activeChannelId && parsed.channels.length > 0) {
            parsed.activeChannelId = parsed.channels[0].id;
          }
          
          setSettings(parsed);
          
          // If user is logged in but didn't have Firestore settings, save them now
          if (user) {
             saveSettingsToBackend(user.uid, parsed);
          }
        } catch (e) {
          console.error("Failed to parse settings", e);
        }
      }
    };

    loadSettings();
  }, [user]);

  const saveSettings = (newSettings: TelegramSettings) => {
    setSettings(newSettings);
    localStorage.setItem('telegramQuizSettings', JSON.stringify(newSettings));
    if (user) {
      saveSettingsToBackend(user.uid, newSettings);
    }
  };

  return {
    settings,
    setSettings,
    saveSettings
  };
}

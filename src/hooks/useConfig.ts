import { useState, useEffect } from 'react';

interface Config {
  apiUrl: string;
  apiKey: string;
  currentMode: string;
}

const CONFIG_KEY = 'eddy-now-playing-config';

export function useConfig() {
  const [config, setConfig] = useState<Config>(() => {
    const stored = localStorage.getItem(CONFIG_KEY);
    return stored ? JSON.parse(stored) : {
      apiUrl: import.meta.env.VITE_API_BASE_URL || '',
      apiKey: import.meta.env.VITE_API_KEY || '',
      currentMode: "lyrics",
    };
  });

  const [isConfigured, setIsConfigured] = useState(
    Boolean(config.apiUrl && config.apiKey)
  );

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    setIsConfigured(Boolean(config.apiUrl && config.apiKey));
  }, [config]);

  const updateConfig = (apiUrl: string, apiKey: string) => {
    // remove trailing slash from api url
    setConfig((prev) => ({
      ...prev,
      apiUrl: apiUrl.replace(/\/$/, ''),
      apiKey,
    }));
  };

  const updateMode = (mode: string) => {
    setConfig((prev) => ({
      ...prev,
      currentMode: mode,
    }));
  };

  return { config, isConfigured, updateConfig, updateMode };
}
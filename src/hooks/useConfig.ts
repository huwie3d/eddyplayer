import { useState, useEffect } from 'react';

interface Config {
  apiUrl: string;
  apiKey: string;
}

const CONFIG_KEY = 'eddy-now-playing-config';

export function useConfig() {
  const [config, setConfig] = useState<Config>(() => {
    const stored = localStorage.getItem(CONFIG_KEY);
    return stored ? JSON.parse(stored) : {
      apiUrl: import.meta.env.VITE_API_BASE_URL || '',
      apiKey: import.meta.env.VITE_API_KEY || ''
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
    setConfig({ apiUrl, apiKey });
  };

  return { config, isConfigured, updateConfig };
}
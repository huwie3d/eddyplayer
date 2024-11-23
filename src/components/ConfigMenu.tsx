import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';

interface ConfigMenuProps {
  onSave: (apiUrl: string, apiKey: string) => void;
  currentApiUrl: string;
  currentApiKey: string;
}

export function ConfigMenu({ onSave, currentApiUrl, currentApiKey }: ConfigMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState(currentApiUrl);
  const [apiKey, setApiKey] = useState(currentApiKey);

  const handleSave = () => {
    onSave(apiUrl, apiKey);
    setIsOpen(false);
  };

  const handleClear = () => {
    setApiUrl('');
    setApiKey('');
    onSave('', '');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <Settings className="w-5 h-5 text-white/60" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-6">Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  API URL
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white border border-white/10 focus:border-white/30 focus:outline-none"
                  placeholder="Enter API URL"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white border border-white/10 focus:border-white/30 focus:outline-none"
                  placeholder="Enter API Key"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
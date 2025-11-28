import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { ApiConfig, ButtonProps } from '../types';
import { Button, Input, Card } from './ui';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSave: (config: ApiConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [formData, setFormData] = useState<ApiConfig>(config);

  useEffect(() => {
    setFormData(config);
  }, [config, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md p-6 shadow-2xl relative bg-white">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-slate-900 mb-1">API Configuration</h2>
        <p className="text-sm text-slate-500 mb-6">Connect to your own AI provider.</p>

        <div className="space-y-4">
          <Input
            id="baseUrl"
            label="API Base URL"
            placeholder="e.g. http://192.168.100.177:3000/v1"
            value={formData.baseUrl}
            onChange={handleChange}
          />
          <p className="text-xs text-slate-400 -mt-2">
             Example: <code>https://api.openai.com/v1</code> or your local address.
          </p>

          <Input
            id="apiKey"
            label="API Key"
            type="password"
            placeholder="sk-..."
            value={formData.apiKey}
            onChange={handleChange}
          />

          <Input
            id="model"
            label="Model Name"
            placeholder="e.g. gemini-1.5-pro or gpt-4-turbo"
            value={formData.model}
            onChange={handleChange}
          />
        </div>

        {formData.baseUrl.startsWith('http://') && (
           <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 items-start text-xs text-amber-800">
             <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
             <p>
               Using <b>HTTP</b> (not HTTPS) on a deployed site may be blocked by your browser ("Mixed Content"). 
               If it fails, try running this app locally or use HTTPS for your API.
             </p>
           </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="gap-2">
            <Save size={16} /> Save Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};
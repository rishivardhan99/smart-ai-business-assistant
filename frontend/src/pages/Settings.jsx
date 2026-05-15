// frontend/src/pages/Settings.jsx
import { useState } from 'react';
import { Save, Bot, Globe, ShieldAlert } from 'lucide-react';
import { api } from '../api/apiConfig'; // Ensure this path matches your API config file

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  
  // In a real app, you would fetch these from your backend on load.
  // For the MVP, we use React state to demonstrate the UI functionality.
  const [settings, setSettings] = useState({
    systemPrompt: "You are a professional, helpful business assistant for SmartAI. Always be concise and ask for an email address to capture leads.",
    llmModel: "gemini-1.5-flash",
    confidenceThreshold: "70",
    googleSheetUrl: "https://docs.google.com/spreadsheets/d/1RVILscE5JTpfSC2VSHaEt1787118XtVdGBV9PFqserw/edit",
    enableAutoSync: false
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate an API call to save settings
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Platform Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your AI agent behaviors, integrations, and system parameters.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* SECTION 1: AI Configuration */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <Bot className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">AI Agent Persona</h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Base System Prompt</label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 font-mono"
                rows="3"
                value={settings.systemPrompt}
                onChange={e => setSettings({...settings, systemPrompt: e.target.value})}
              />
              <p className="text-xs text-gray-500 mt-1.5">This instructs the Planner and Executor agents on how to behave during chat interactions.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Primary LLM Model</label>
                <select 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 bg-white"
                  value={settings.llmModel}
                  onChange={e => setSettings({...settings, llmModel: e.target.value})}
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Cost-Effective)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (High Reasoning)</option>
                  <option value="llama-3-groq">Llama 3 70B via Groq (Fallback)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Auto-Sync Confidence Threshold (%)</label>
                <input 
                  type="number" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700"
                  value={settings.confidenceThreshold}
                  onChange={e => setSettings({...settings, confidenceThreshold: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Integrations */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <Globe className="text-emerald-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">External Integrations</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Google Sheets CRM URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  value={settings.googleSheetUrl}
                  readOnly
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">For security reasons, this is configured via backend <code>.env</code> variables and cannot be edited here.</p>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-4">
              <input 
                type="checkbox" 
                id="autoSync" 
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                checked={settings.enableAutoSync}
                onChange={e => setSettings({...settings, enableAutoSync: e.target.checked})}
              />
              <label htmlFor="autoSync" className="text-sm font-medium text-gray-700 cursor-pointer">
                Automatically push leads to CRM if AI Confidence is above threshold (Bypasses Admin Review)
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 3: System Management / Danger Zone */}
        <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-200 flex items-center gap-2">
            <ShieldAlert className="text-red-600" size={20} />
            <h2 className="text-lg font-semibold text-red-800">Danger Zone</h2>
          </div>
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Purge Lead Database</h3>
              <p className="text-xs text-gray-500 mt-1">Permanently delete all captured leads and traces. This action cannot be undone.</p>
            </div>
            <button 
              onClick={async () => {
                if(window.confirm("⚠️ ARE YOU ABSOLUTELY SURE?\n\nThis will permanently delete all leads and generated drafts from the database. This action CANNOT be undone.")) {
                  setIsPurging(true);
                  try {
                    const response = await api.delete('/leads/purge');
                    alert(`Success: ${response.data.message}`);
                  } catch (err) {
                    console.error("Purge failed:", err);
                    alert("Failed to purge data. Ensure your backend is running.");
                  } finally {
                    setIsPurging(false);
                  }
                }
              }}
              disabled={isPurging}
              className="px-4 py-2 bg-white border border-red-300 text-red-600 font-bold rounded-lg text-sm hover:bg-red-50 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {isPurging ? 'Purging Database...' : 'Purge All Data'}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {isSaving ? "Saving Configuration..." : "Save All Settings"}
          </button>
        </div>

      </div>
    </div>
  );
}
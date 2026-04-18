import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SettingsFooterProps {
  onSave: () => void;
}

export default function SettingsFooter({ onSave }: SettingsFooterProps) {
  const navigate = useNavigate();
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveClick = () => {
    onSave();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
      {isConfirmingReset ? (
        <div className="flex items-center gap-2 bg-red-50 p-1 rounded-xl border border-red-100">
          <span className="text-xs font-bold text-red-700 px-2">Reset All?</span>
          <button
            onClick={() => setIsConfirmingReset(false)}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white rounded-lg transition-colors"
          >
            No
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
          >
            Yes
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsConfirmingReset(true)}
          className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all whitespace-nowrap"
        >
          Reset All Data
        </button>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap"
        >
          Back to Home
        </button>
        <button
          onClick={handleSaveClick}
          className={`px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-colors shadow-sm whitespace-nowrap ${
            isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSaved ? 'Saved!' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}

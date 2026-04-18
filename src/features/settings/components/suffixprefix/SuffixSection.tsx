import React from 'react';
import { TelegramSettings, SavedText } from '../../../../types';
import SavedTextCard from '../shared/SavedTextCard';
import AddSuffixInput from './AddSuffixInput';

interface SuffixSectionProps {
  settings: TelegramSettings;
  user: any;
  newSuffix: string;
  setNewSuffix: (val: string) => void;
  addSuffix: () => void;
  removeSuffix: (id: string) => void;
  selectSuffix: (item: SavedText | null | undefined) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  activeSuffixId?: string;
  isGlobalMode: boolean;
}

export default function SuffixSection({
  settings,
  user,
  newSuffix,
  setNewSuffix,
  addSuffix,
  removeSuffix,
  selectSuffix,
  confirmDeleteId,
  setConfirmDeleteId,
  activeSuffixId,
  isGlobalMode
}: SuffixSectionProps) {
  return (
    <div className={!user ? "opacity-50 pointer-events-none" : ""}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-slate-700">Explanation Suffix Library</label>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Max 200 chars</span>
      </div>

      {/* Saved Suffixes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {!isGlobalMode && (
          <SavedTextCard 
            item={null}
            isActive={activeSuffixId === undefined}
            onSelect={() => selectSuffix(undefined)}
            activeColor="purple"
            label="Use Global Default"
          />
        )}

        <SavedTextCard 
          item={null}
          isActive={activeSuffixId === 'none' || (isGlobalMode && !activeSuffixId)}
          onSelect={() => selectSuffix(null)}
          activeColor="purple"
          label="None (No Suffix)"
        />

        {(settings.suffixes || []).map(item => (
          <SavedTextCard 
            key={item.id}
            item={item}
            isActive={activeSuffixId === item.id}
            onSelect={() => selectSuffix(item)}
            onRemove={removeSuffix}
            confirmDeleteId={confirmDeleteId}
            setConfirmDeleteId={setConfirmDeleteId}
            activeColor="purple"
          />
        ))}
      </div>

      {/* Add New Suffix */}
      <AddSuffixInput 
        value={newSuffix}
        onChange={setNewSuffix}
        onAdd={addSuffix}
      />

      <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
        <p className="text-[11px] text-amber-700 leading-relaxed">
          <strong>বিঃদ্রঃ:</strong> টেলিগ্রামের নিয়ম অনুযায়ী ব্যাখ্যা সর্বোচ্চ ২০০ ক্যারেক্টার হতে পারে।
        </p>
      </div>
    </div>
  );
}

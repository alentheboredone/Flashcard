import React from 'react';
import { Plane, Briefcase, UtensilsCrossed } from 'lucide-react';
import { cn } from './lib/utils';

interface SetSelectorProps {
  currentSet: string;
  onSetChange: (set: string) => void;
}

const CARD_SETS = [
  { id: 'travel', name: 'Travel', icon: Plane },
  { id: 'business', name: 'Business', icon: Briefcase },
  { id: 'food', name: 'Food', icon: UtensilsCrossed },
] as const;

export function SetSelector({ currentSet, onSetChange }: SetSelectorProps) {
  return (
    <div className="flex gap-4 mb-8">
      {CARD_SETS.map(({ id, name, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSetChange(id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            currentSet === id
              ? "bg-indigo-100 text-indigo-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          <Icon size={20} />
          <span>{name}</span>
        </button>
      ))}
    </div>
  );
}
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const LANGUAGE_LEVELS = ["A1.1", "A1.2", "B1.1 (1-30)",
  "B1.1 (31-60)",
  "B1.1 (61-90)",
  "B1.1 (91-120)",
  "B1.1 (121-150)",
  "B1.1 (151-180)",
  "B1.1 (181-210)",
  "B1.1 (211-240)",
  "B1.1 (241-270)",
  "B1.1 (271-300)",
  "B1.1 (301-330)",
  "B1.1 (331-360)",
  "B1.1 (361-390)",
  "B1.1 (391-420)",
  "B1.1 (421-450)",
  "B1.1 (451-480)",
  "B1.1 (481-510)",
  "B1.1 (511-540)",
  "B1.1 (541-570)",
  "B1.1 (571-579)"] as const;
const CARD_SETS = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"
] as const;
type LanguageLevel = typeof LANGUAGE_LEVELS[number];
//type CardSet = typeof CARD_SETS[number];
interface LevelSelectorProps {
  onLevelChange: (value: LanguageLevel) => void;
}

export function LevelSelector({ onLevelChange }: LevelSelectorProps) {
  return (
    <div className="mb-4">
      <Select onValueChange={onLevelChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Level" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGE_LEVELS.map((level) => (
            <SelectItem key={level} value={level}>
              {level}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
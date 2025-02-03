//app/components/LevelSelector.tsx
import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";



export type LanguageLevel = string;

interface LevelSelectorProps {
  selectedLevel: LanguageLevel;
  onLevelChange: (value: LanguageLevel) => void;
  /** 
   * Optional: when provided, the dropdown will show only levels that begin with this base level.
   * For example, if baseLevel is "B1.1", only options starting with "B1.1" will be shown.
   */
  baseLevel?: string;
}

export function LevelSelector({
  selectedLevel,
  onLevelChange,
  baseLevel,
}: LevelSelectorProps) {
  const [options, setOptions] = useState<LanguageLevel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLevels() {
      setLoading(true);
      try {
        // Build the URL; if baseLevel is provided, add it as a query parameter.
        let url = '/api/levels';
        if (baseLevel) {
          url += `?baseLevel=${encodeURIComponent(baseLevel)}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        let fetchedLevels: LanguageLevel[] = data.levels;

        // Sort the levels in ascending order by the numeric start of the range.
        fetchedLevels.sort((a, b) => {
          // Use a regular expression to extract the starting number from the level string.
          // Example: for "B1.1 (1-30)" this extracts "1".
          const matchA = a.match(/\((\d+)-/);
          const matchB = b.match(/\((\d+)-/);
          const numA = matchA ? parseInt(matchA[1], 10) : 0;
          const numB = matchB ? parseInt(matchB[1], 10) : 0;
          return numA - numB;
        });
        
        setOptions(fetchedLevels);
      } catch (error) {
        console.error('Error fetching levels:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLevels();
  }, [baseLevel]);

  if (loading) {
    return <div>Loading levels...</div>;
  }

  return (
    <div className="mb-4">
      <Select value={selectedLevel} onValueChange={onLevelChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Level" />
        </SelectTrigger>
        <SelectContent>
          {options.map((level) => (
            <SelectItem key={level} value={level}>
              {level}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
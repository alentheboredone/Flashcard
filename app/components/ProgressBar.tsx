import React from 'react';
import { Brain, GraduationCap, BookOpen } from 'lucide-react';
import { cn } from "./lib/utils";

interface ProgressBarProps {
  mastered: number;
  learning: number;
  reviewing: number;
  total: number;
}

const progressSegments = [
  {
    key: 'mastered',
    label: 'Mastered',
    Icon: GraduationCap,
    iconClass: 'text-success',
    barClass: 'bg-success',
  },
  {
    key: 'learning',
    label: 'Learning',
    Icon: BookOpen,
    iconClass: 'text-primary',
    barClass: 'bg-primary',
  },
  {
    key: 'reviewing',
    label: 'Reviewing',
    Icon: Brain,
    iconClass: 'text-warning',
    barClass: 'bg-warning',
  },
] as const;

export function ProgressBar({ mastered, learning, reviewing, total }: ProgressBarProps) {
  const getWidth = (value: number) => (value / total) * 100;
  const values = { mastered, learning, reviewing };
  console.log('Progress values:', values);
  console.log('Progress segments:', progressSegments);
  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between mb-2">
        {progressSegments.map(({ key, label, Icon, iconClass }) => (
          <div key={key} className="flex items-center gap-2">
            <Icon className={cn(iconClass)} size={20} />
            <span className="text-sm text-muted-foreground">
              {label}: {values[key as keyof typeof values]}
            </span>
          </div>
        ))}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full flex">
          {progressSegments.map(({ key, barClass }) => (
            <div 
              key={key}
              className={cn(barClass, "transition-all duration-500")}
              style={{ width: `${getWidth(values[key as keyof typeof values])}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Progress } from "@/app/components/ui/progress";

interface ProgressTrackerProps {
  categoryCounts: Record<string, number>;
  totalCards: number;
}

interface ProgressSectionProps {
  category: string;
  count: number;
  total: number;
  color: string;
  prefix?: string;
}

function ProgressSection({ category, count, total, color, prefix = "You are" }: ProgressSectionProps) {
  return (
    <div>
      <p className="text-white mb-2">
        {category === "New" 
          ? `New words: ${count} out of ${total} words`
          : `${prefix} ${category.toLowerCase()} ${count} out of ${total} words`
        }
      </p>
      <Progress 
        value={(count / total) * 100} 
        className="h-2 bg-white/20" 
        indicatorClassName={`bg-${color}-500`} 
      />
    </div>
  );
}

export function ProgressTracker({ categoryCounts, totalCards }: ProgressTrackerProps) {
  const sections = [
    { category: "Mastered", color: "green", prefix: "You have" },
    { category: "Reviewing", color: "yellow" },
    { category: "Learning", color: "red" },
    { category: "New", color: "blue" },
  ];

  return (
    <div className="space-y-4">
      {sections.map(({ category, color, prefix }) => (
        <ProgressSection
          key={category}
          category={category}
          count={categoryCounts[category] || 0}
          total={totalCards}
          color={color}
          prefix={prefix}
        />
      ))}
    </div>
  );
}
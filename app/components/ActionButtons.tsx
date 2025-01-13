import React from 'react';
import { Button } from "./ui/button";

interface ActionButtonsProps {
  onKnew: () => void;
  onDidNotKnow: () => void;
  disabled: boolean;
}

export function ActionButtons({ onKnew, onDidNotKnow, disabled }: ActionButtonsProps) {
  return (
    <div className="space-y-2 mb-6">
      <Button
        variant="default"
        className="w-full h-12"
        onClick={onKnew}
        disabled={disabled}
      >
        I knew this word
      </Button>
      <Button
        variant="destructive"
        className="w-full h-12"
        onClick={onDidNotKnow}
        disabled={disabled}
      >
        I did not know this word
      </Button>
    </div>
  );
}
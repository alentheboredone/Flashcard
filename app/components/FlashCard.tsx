import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { cn } from "./lib/utils";

interface FlashcardProps {
  card: {
    german: string;
    english: string;
    example: string;
    category: string;
    isNew: boolean;
  } | null;
  isFlipped: boolean;
  currentCardIndex: number;
  onFlip: () => void;
}

const getCategoryLabel = (card: { isNew: boolean; category: string }) => {
  if (card.isNew) return "New Word";
  return card.category;
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "New Word": return "bg-primary text-primary-foreground";
    case "Learning": return "bg-destructive text-destructive-foreground";
    case "Reviewing": return "bg-warning text-warning-foreground";
    case "Mastered": return "bg-success text-success-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

export function FlashCard({ card, isFlipped, currentCardIndex, onFlip }: FlashcardProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCardIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="min-h-[200px] flex flex-col items-center justify-center cursor-pointer relative"
            onClick={onFlip}
          >
            {card ? (
              <>
                <span className={cn(
                  "absolute top-0 left-0 text-xs px-2 py-1 rounded",
                  getCategoryColor(getCategoryLabel(card))
                )}>
                  {getCategoryLabel(card)}
                </span>
                <span className="text-3xl font-bold mb-4">
                  {isFlipped ? card.english : card.german}
                </span>
                {isFlipped && (
                  <p className="text-muted-foreground text-center">{card.example}</p>
                )}
              </>
            ) : (
              <p className="text-xl text-center">No cards available for this level</p>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
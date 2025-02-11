// app/flashcards/[level]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FlashCard as FlashCardComponent } from '@/app/components/FlashCard';
import { ProgressTracker } from '@/app/components/ProgressTracker';
import { LevelSelector, LanguageLevel } from '@/app/components/LevelSelector';
import { ActionButtons } from '@/app/components/ActionButtons';
import { getVocabulary } from '@/app/data/vocabulary';
import { FlashCardWithState } from '@/app/lib/types';

// A helper to generate a storage key for a given level
function getSessionKeyForLevel(level: string) {
  return `flashcardSession_${level}`;
}

// A helper for weighted random selection.
function weightedRandomSelect(
  cards: FlashCardWithState[],
  weightFn: (card: FlashCardWithState) => number
): FlashCardWithState | null {
  const weights = cards.map(weightFn);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight === 0) return null;
  let random = Math.random() * totalWeight;
  for (let i = 0; i < cards.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return cards[i];
    }
  }
  return cards[cards.length - 1];
}

export default function FlashcardPage() {
  // 1. Extract the base level from the URL (e.g. "B1.1")
  const params = useParams();
  const baseLevel = params.level; 

  // 2. Initialize our selected sublevel (e.g. "B1.1 (1-30)")
  const defaultSubLevel = baseLevel + " (1-30)";

  // 3. Set up state.
  const [level, setLevel] = useState<LanguageLevel>(defaultSubLevel as LanguageLevel);
  const [limit, setLimit] = useState(30);
  const [offset, setOffset] = useState(0);
  const [flashcards, setFlashcards] = useState<FlashCardWithState[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastShownId, setLastShownId] = useState<string | null>(null);

  // 4. On mount or when level/limit/offset change, load saved session (if exists) or fetch fresh data.
  useEffect(() => {
    const sessionKey = getSessionKeyForLevel(level);
    const savedSession = localStorage.getItem(sessionKey);
    if (savedSession) {
      // Restore the session from localStorage
      const { savedFlashcards, savedCurrentIndex, savedLevel } = JSON.parse(savedSession);
      console.log("Restoring session from localStorage for level:", savedLevel);
      setLevel(savedLevel || level);
      setFlashcards(savedFlashcards);
      setCurrentCardIndex(savedCurrentIndex);
      setLoading(false);
    } else {
      // No saved data, so fetch from the backend.
      const fetchVocabulary = async () => {
        try {
          setLoading(true);
          console.log("Fetching vocabulary for level:", level);
          const fetchedVocabulary = await getVocabulary(level, limit, offset);
          console.log("Fetched data:", fetchedVocabulary);
          const flashcardsWithState = fetchedVocabulary.map((word) => ({
            ...word,
            reviewCount: 0,
            interval: 1,
            isNew: true,
            lastShown: -1,
          }));
          setFlashcards(flashcardsWithState);
        } catch (error) {
          console.error('Error fetching vocabulary:', error);
        } finally {
          setLoading(false);
        }
      };
    
      fetchVocabulary();
    }
  }, [level, limit, offset]);

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-4">
        Loading...
      </div>
    );
  }

  // 5. Determine the current card.
  const cardsInLevel = flashcards;
  const nonMasteredCards = cardsInLevel.filter(card => card.category !== 'mastered');
  const filteredCards = nonMasteredCards.length > 0 ? nonMasteredCards : cardsInLevel;
  const currentCard = cardsInLevel.length > 0 
    ? filteredCards[currentCardIndex % filteredCards.length]
    : null;

  // 6. Calculate category counts for progress tracking.
  const categoryCounts = {
    New: cardsInLevel.filter(card => card.isNew).length,
    Learning: cardsInLevel.filter(card => !card.isNew && card.category === 'learning').length,
    Reviewing: cardsInLevel.filter(card => !card.isNew && card.category === 'reviewing').length,
    Mastered: cardsInLevel.filter(card => !card.isNew && card.category === 'mastered').length,
  };
  const totalCards = cardsInLevel.length;

  // 7. Spaced Repetition Logic: update the card based on user performance.
  function updateCardAfterReview(card: FlashCardWithState, wasCorrect: boolean): FlashCardWithState {
    if (!wasCorrect) {
      // If the user did not know it, reset the interval to 1.
      return {
        ...card,
        reviewCount: card.reviewCount, // optional
        interval: 1,
        isNew: false,
        category: 'learning',
        lastShown: Date.now(),
      };
    } else {
      if (card.isNew) {
        // If the card is new and answered correctly, immediately master it.
        return {
          ...card,
          reviewCount: card.reviewCount, // optional
          interval: 16, // high interval so it appears only after non-mastered cards are done
          isNew: false,
          category: 'mastered',
          lastShown: Date.now(),
        };
      } else {
        // For reviewed cards, double the interval.
        const newInterval = card.interval * 2;
        let newCategory: 'learning' | 'reviewing' | 'mastered';
        if (newInterval < 3) {
          newCategory = 'learning';
        } else if (newInterval < 7) {
          newCategory = 'reviewing';
        } else {
          newCategory = 'mastered';
        }
        return {
          ...card,
          reviewCount: card.reviewCount,
          interval: newInterval,
          isNew: false,
          category: newCategory,
          lastShown: Date.now(),
        };
      }
    }
  }

  // 8. Use weighted random selection to pick the next card.
  function getNextCard(cards: FlashCardWithState[], lastShownId: string | null): FlashCardWithState | null {
    // Exclude the last shown card.
    const candidates = cards.filter(card => card.id !== lastShownId);
    // Prefer non-mastered cards.
    const nonMasteredCandidates = candidates.filter(card => card.category !== 'mastered');
    const finalCandidates = nonMasteredCandidates.length > 0 ? nonMasteredCandidates : candidates;
  
    // Weight function: new cards get weight 1; reviewed cards get weight = 1/interval.
    const weightFn = (card: FlashCardWithState) => {
      return card.isNew ? 1 : 1 / card.interval;
    };
  
    return weightedRandomSelect(finalCandidates, weightFn);
  }

  // 9. Update the current card and save the session after a review.
  function updateCardCategory(wasCorrect: boolean) {
    setFlashcards(prevCards => {
      const updatedCards = prevCards.map(card => {
        if (card.id !== currentCard?.id) return card;
        return updateCardAfterReview(card, wasCorrect);
      });
  
      const nextCard = getNextCard(updatedCards, currentCard?.id || null);
      let nextIndex = currentCardIndex;
      if (nextCard) {
        nextIndex = updatedCards.findIndex(card => card.id === nextCard.id);
        setCurrentCardIndex(nextIndex);
        setLastShownId(currentCard?.id || null);
      }
      setIsFlipped(false);
  
      // Save session to localStorage using the level-specific key.
      const sessionKey = getSessionKeyForLevel(level);
      const sessionData = {
        savedFlashcards: updatedCards,
        savedCurrentIndex: nextIndex,
        savedLevel: level,
      };
      localStorage.setItem(sessionKey, JSON.stringify(sessionData));
  
      return updatedCards;
    });
  }

  // 10. Render the component.
  return (
    <div className="min-h-screen bg-purple-900 text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Level Selector */}
        <LevelSelector
          baseLevel={String(baseLevel)}
          selectedLevel={level}
          onLevelChange={(selectedLevel) => {
            // When the level changes, update state and load the saved session (if any) for that level.
            setLevel(selectedLevel as LanguageLevel);
            const sessionKey = getSessionKeyForLevel(selectedLevel as string);
            const savedSession = localStorage.getItem(sessionKey);
            if (savedSession) {
              const { savedFlashcards, savedCurrentIndex, savedLevel } = JSON.parse(savedSession);
              setFlashcards(savedFlashcards);
              setCurrentCardIndex(savedCurrentIndex);
              setLevel(savedLevel);
            } else {
              // Optionally, you might fetch fresh data if no session exists.
              // For simplicity, we do nothing here.
            }
          }}
        />

        {/* Flashcard Display */}
        <FlashCardComponent
          card={currentCard}
          isFlipped={isFlipped}
          currentCardIndex={currentCardIndex}
          onFlip={() => setIsFlipped(!isFlipped)}
        />

        {/* Action Buttons */}
        <ActionButtons
          onKnew={() => updateCardCategory(true)}
          onDidNotKnow={() => updateCardCategory(false)}
          disabled={!currentCard}
        />

        {/* Progress Tracker */}
        <ProgressTracker
          categoryCounts={categoryCounts}
          totalCards={totalCards}
        />
      </div>
    </div>
  );
}

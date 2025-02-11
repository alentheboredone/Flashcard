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
  // Extract the base level from the URL (e.g. "B1.1")
  const params = useParams();
  const baseLevel = params.level; 

  // Initialize our selected sublevel (e.g. "B1.1 (1-30)")
  const defaultSubLevel = baseLevel + " (1-30)";

  // Set up state.
  const [level, setLevel] = useState<LanguageLevel>(defaultSubLevel as LanguageLevel);
  const [limit, setLimit] = useState(30);
  const [offset, setOffset] = useState(0);
  const [flashcards, setFlashcards] = useState<FlashCardWithState[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastShownId, setLastShownId] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have saved flashcards in local storage
    const sessionKey = getSessionKeyForLevel(level); 
    const savedSession = localStorage.getItem('flashcardSession');
    if (savedSession) {
      // Parse and set the state from local storage
      const { savedFlashcards, savedCurrentIndex, savedLevel } = JSON.parse(savedSession);

      // 1. Set the level from local storage (if you want to)
      setLevel(savedLevel || level);

      // 2. Set the flashcards state
      setFlashcards(savedFlashcards);

      // 3. Set the current card index
      setCurrentCardIndex(savedCurrentIndex);

      // 4. We're done loading
      setLoading(false);
    } else {
      // No saved data; fetch from the backend as before
      setLoading(true);
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

  // Create a filtered list of cards.
  const cardsInLevel = flashcards;
  const nonMasteredCards = cardsInLevel.filter(card => card.category !== 'mastered');
  const filteredCards = nonMasteredCards.length > 0 ? nonMasteredCards : cardsInLevel;
  const currentCard = cardsInLevel.length > 0 
    ? filteredCards[currentCardIndex % filteredCards.length]
    : null;

  // Category counts for the progress tracker.
  const categoryCounts = {
    New: cardsInLevel.filter(card => card.isNew).length,
    Learning: cardsInLevel.filter(card => !card.isNew && card.category === 'learning').length,
    Reviewing: cardsInLevel.filter(card => !card.isNew && card.category === 'reviewing').length,
    Mastered: cardsInLevel.filter(card => !card.isNew && card.category === 'mastered').length,
  };

  const totalCards = cardsInLevel.length;

  // --- Spaced Repetition Logic ---

  // Update a card based on whether the user got it correct.
  function updateCardAfterReview(card: FlashCardWithState, wasCorrect: boolean): FlashCardWithState {
    if (!wasCorrect) {
      // If the user did not know it, reset the interval to 1.
      return {
        ...card,
        reviewCount: card.reviewCount, // optionally update if desired
        interval: 1,
        isNew: false,
        category: 'learning',
        lastShown: Date.now(),
      };
    } else {
      if (card.isNew) {
        // If the card is new and answered correctly, mark it immediately as mastered.
        return {
          ...card,
          reviewCount: card.reviewCount, // optional
          interval: 16, // a high interval so it won't reappear until all others are mastered
          isNew: false,
          category: 'mastered',
          lastShown: Date.now(),
        };
      } else {
        // For already reviewed cards, increase the interval (here, simply doubling it).
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

  // Weighted random selection that returns a card.
  // Here we combine both new and reviewed cards:
  // - For new cards, a fixed weight (e.g., 1).
  // - For reviewed cards, weight = 1/interval (so lower interval means more likely).
  function getNextCard(cards: FlashCardWithState[], lastShownId: string | null): FlashCardWithState | null {
    // First, filter out the last shown card.
    const candidates = cards.filter(card => card.id !== lastShownId);
    // If there are non-mastered cards, prefer them.
    const nonMasteredCandidates = candidates.filter(card => card.category !== 'mastered');
    const finalCandidates = nonMasteredCandidates.length > 0 ? nonMasteredCandidates : candidates;
  
    // Weight function: new cards get weight 1; reviewed cards get weight = 1/interval.
    const weightFn = (card: FlashCardWithState) => {
      return card.isNew ? 1 : 1 / card.interval;
    };
  
    return weightedRandomSelect(finalCandidates, weightFn);
  }

  // --- Update the current card and state after a review ---
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

      // --- SAVE to localStorage here ---
      const sessionKey = getSessionKeyForLevel(level);
      const sessionData = {
      savedFlashcards: updatedCards,
      savedCurrentIndex: nextIndex,
      savedLevel: level, // if you want to remember which sublevel user was in
      };
      localStorage.setItem(sessionKey, JSON.stringify(sessionData));

      return updatedCards;
    });
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Level Selector */}
        <LevelSelector
          baseLevel={String(baseLevel)}
          selectedLevel={level}
          onLevelChange={(selectedLevel) => {
            setLevel(selectedLevel as LanguageLevel);
            
            // Save the new level in the session too (just in case):
            const sessionDataString = localStorage.getItem('flashcardSession');
            if (sessionDataString) {
            const sessionData = JSON.parse(sessionDataString);
            sessionData.savedLevel = selectedLevel;
            localStorage.setItem('flashcardSession', JSON.stringify(sessionData));
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

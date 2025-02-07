// app/flashcards/[level]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FlashCard as FlashCardComponent } from '@/app/components/FlashCard';
import { ProgressTracker } from '@/app/components/ProgressTracker';
import { ProgressBar } from '@/app/components/ProgressBar';
import { LevelSelector, LanguageLevel } from '@/app/components/LevelSelector';
import { ActionButtons } from '@/app/components/ActionButtons';
import { getVocabulary } from '@/app/data/vocabulary';
import { FlashCardWithState } from '@/app/lib/types';

export default function FlashcardPage() {
  // Extract the base level from the URL (e.g. "B1.1")
  const params = useParams();
  const baseLevel = params.level; 

  // We'll initialize our selected sublevel.
  // For example, if the base level is "B1.1", the default might be "B1.1 (1-30)".
  // You can decide on the default however you wish.
  const defaultSubLevel = baseLevel + " (1-30)";

  // Set up state for the current level (which is a full sublevel string).
  const [level, setLevel] = useState<LanguageLevel>(defaultSubLevel as LanguageLevel);
  const [limit, setLimit] = useState(30);
  const [offset, setOffset] = useState(0);
  const [flashcards, setFlashcards] = useState<FlashCardWithState[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastShownIndex, setLastShownIndex] = useState<number>(-1);

  useEffect(() => {
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
  }, [level, limit, offset]);

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-4">
        Loading...
      </div>
    );
  }

  // (Rest of your flashcard page logic remains unchanged.)

  const cardsInLevel = flashcards;
  const nonMasteredCards = cardsInLevel.filter(card => card.category !== 'mastered');
  const filteredCards = nonMasteredCards.length > 0 ? nonMasteredCards : cardsInLevel;
  const currentCard = cardsInLevel.length > 0 
    ? filteredCards[currentCardIndex % filteredCards.length]
    : null;

  /*const categoryCounts = {
    New: cardsInLevel.filter(card => card.isNew).length,
    Learning: cardsInLevel.filter(card => !card.isNew && card.reviewCount < 3).length,
    Reviewing: cardsInLevel.filter(card => !card.isNew && card.reviewCount >= 3 && card.reviewCount < 7).length,
    Mastered: cardsInLevel.filter(card => !card.isNew && card.reviewCount >= 7).length,
  };*/

  const categoryCounts = {
    New: cardsInLevel.filter(card => card.isNew).length,
    Learning: cardsInLevel.filter(card => !card.isNew && card.category === 'learning').length,
    Reviewing: cardsInLevel.filter(card => !card.isNew && card.category === 'reviewing').length,
    Mastered: cardsInLevel.filter(card => !card.isNew && card.category === 'mastered').length,
  };
  

  const totalCards = cardsInLevel.length;

  function updateCardAfterReview(card: FlashCardWithState, wasCorrect: boolean): FlashCardWithState {
    // We want cards the user did not know to appear more often.
    // If the user did not know the card, reset the interval to 1.
    // If the user knew it, increase the interval (for example, multiply by 2).
    if (!wasCorrect) {
      return {
        ...card,
        interval: 1,       // reset interval so that the card comes up soon
        isNew: false,      // mark as reviewed
        category: 'learning', // you might consider it still "learning"
        lastShown: Date.now(),
      };
    } else {
      // If correct, increase the interval
      const newInterval = card.isNew ? 2 : card.interval * 2;
      // Optionally, update category based on the new interval:
      let newCategory: 'learning' | 'reviewing' | 'mastered';
      if (newInterval < 4) {
        newCategory = 'learning';
      } else if (newInterval < 8) {
        newCategory = 'reviewing';
      } else {
        newCategory = 'mastered';
      }
      return {
        ...card,
        interval: newInterval,
        isNew: false,
        category: newCategory,
        lastShown: Date.now(),
      };
    }
  }
  function getNextCard(cards: FlashCardWithState[], lastShownId: string | null): FlashCardWithState | null {
    // First, filter out the card that was just shown (if possible)
    const candidates = cards.filter(card => card.id !== lastShownId);
    
    // Prefer new cards if any exist
    const newCards = candidates.filter(card => card.isNew);
    if (newCards.length > 0) {
      // Return a random new card
      return newCards[Math.floor(Math.random() * newCards.length)];
    }
    
    // Otherwise, sort by interval (lowest first)
    candidates.sort((a, b) => a.interval - b.interval);
    return candidates.length > 0 ? candidates[0] : null;
  }

  function updateCardCategory(wasCorrect: boolean) {
    setFlashcards((prevCards) => {
      const updatedCards = prevCards.map((card) => {
        if (card.id !== currentCard?.id) return card;
        return updateCardAfterReview(card, wasCorrect);
      });
      
      const nextCard = getNextCard(updatedCards, currentCard?.id || null);
      if (nextCard) {
        setCurrentCardIndex(updatedCards.findIndex(card => card.id === nextCard.id));
      }
      
      setIsFlipped(false);
      return updatedCards;
    });
  }
  

  /*function updateCardCategory(wasCorrect: boolean) {
    // ... (your update logic remains unchanged)
    setFlashcards(cards =>
      cards.map((card) => {
        if (card.id !== currentCard?.id) return card;

        let newReviewCount = card.reviewCount;
        let isNew = card.isNew;

        if (!wasCorrect && card.category === 'mastered') {
          newReviewCount = 3;
          isNew = false;
        } else if (card.isNew) {
          if (wasCorrect) {
            newReviewCount = 7;
            isNew = false;
          } else {
            newReviewCount = 1;
            isNew = false;
          }
        } else if (newReviewCount < 3) {
          if (wasCorrect) {
            newReviewCount += 1;
          } else {
            newReviewCount = Math.max(0, newReviewCount - 1);
          }
        } else if (newReviewCount >= 3 && newReviewCount < 7) {
          if (wasCorrect) {
            newReviewCount += 1;
          } else {
            newReviewCount = 3;
          }
        }

        let newCategory: 'mastered' | 'learning' | 'reviewing' = 'mastered';
        if (isNew) {
          newCategory = 'learning';
        } else if (newReviewCount < 3) {
          newCategory = 'learning';
        } else if (newReviewCount >= 3 && newReviewCount < 7) {
          newCategory = 'reviewing';
        }

        return {
          ...card,
          reviewCount: newReviewCount,
          isNew: isNew,
          category: newCategory,
          lastShown: Date.now(),
        };
      })
    );

    setCurrentCardIndex((prevIndex) => {
      let shuffledIndex;
      do {
        shuffledIndex = Math.floor(Math.random() * filteredCards.length);
      } while (shuffledIndex === lastShownIndex && filteredCards.length > 1);
      setLastShownIndex(shuffledIndex);
      return shuffledIndex;
    });

    setIsFlipped(false);
  }*/

  return (
    <div className="min-h-screen bg-purple-900 text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Pass baseLevel to the LevelSelector so that it only shows options matching the base level */}
        <LevelSelector
          baseLevel={String(baseLevel)}
          selectedLevel={level}
          onLevelChange={(selectedLevel) => {
            setLevel(selectedLevel as LanguageLevel);
          }}
        />

        <FlashCardComponent
          card={currentCard}
          isFlipped={isFlipped}
          currentCardIndex={currentCardIndex}
          onFlip={() => setIsFlipped(!isFlipped)}
        />

        <ActionButtons
          onKnew={() => updateCardCategory(true)}
          onDidNotKnow={() => updateCardCategory(false)}
          disabled={!currentCard}
        />
        <ProgressTracker
          categoryCounts={categoryCounts}
          totalCards={totalCards}
        />
      </div>
    </div>
  );
}
//ProgressBar
          //mastered={categoryCounts.Mastered}
          //learning={categoryCounts.Learning}
          //reviewing={categoryCounts.Reviewing}
          //total={totalCards}


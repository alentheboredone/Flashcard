'use client'

import { useState, useEffect } from 'react'
import { FlashCard as FlashCardComponent } from './components/FlashCard'
import { ProgressTracker } from './components/ProgressTracker'
import { ProgressBar } from './components/ProgressBar'
import { LevelSelector } from './components/LevelSelector'
import { ActionButtons } from './components/ActionButtons'
import { getVocabulary } from './data/vocabulary'; // Import the new dynamic function
import { FlashCardWithStateSchema, type FlashCardWithState } from './lib/types'


function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function Page(): JSX.Element {
  //const [level, setLevel] = useState("B1.1 (31-60)"); // Default level
  const [level, setLevel] = useState("B1.1 (1-30)"); // Use `level` as the single source of truth
  const [limit, setLimit] = useState(30); // Default limit
  const [offset, setOffset] = useState(0); // Default offset
  const [flashcards, setFlashcards] = useState<FlashCardWithState[]>([]);
  const [loading, setLoading] = useState(true); // Loading state for fetching data
  //const [currentLevel, setCurrentLevel] = useState<string>('');
  //const [currentSet, setCurrentSet] = useState<string>(''); // Track selected card set
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastShownIndex, setLastShownIndex] = useState<number>(-1);
  
  useEffect(() => {
    // Fetch data from the database
    const fetchVocabulary = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        console.log("Fetching level:", level); // Debugging
        const fetchedVocabulary = await getVocabulary(level, limit, offset);
        console.log("Fetched data:", fetchedVocabulary); // Debugging
        const flashcardsWithState = fetchedVocabulary.map(word => ({
          ...word,
          reviewCount: 0,
          isNew: true,
          lastShown: -1,
        }));
        setFlashcards(flashcardsWithState);
      } catch (error) {
        console.error('Error fetching vocabulary:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchVocabulary();
  }, [level]);

  if (loading) {
    return <div className="min-h-screen bg-purple-900 text-white p-4">Loading...</div>;
  }
  // First, get all cards for the current level
  const cardsInLevel = flashcards;
  // Then, get non-mastered cards
  const nonMasteredCards = cardsInLevel.filter(card => card.category !== 'mastered');

  // Choose which array to use based on whether there are non-mastered cards
  const filteredCards = nonMasteredCards.length > 0 ? nonMasteredCards : cardsInLevel;

  // Get current card without shuffling on every render
  const currentCard = cardsInLevel.length > 0 
    ? filteredCards[currentCardIndex % filteredCards.length]
    : null;

  console.log('Current Index:', currentCardIndex);
  const categoryCounts = {
    New: cardsInLevel.filter(card => card.isNew).length,
    Learning: cardsInLevel.filter(card => !card.isNew && card.reviewCount < 3).length,
    Reviewing: cardsInLevel.filter(card => !card.isNew && card.reviewCount >= 3 && card.reviewCount < 7).length,
    Mastered: cardsInLevel.filter(card => !card.isNew && card.reviewCount >= 7).length,
  };
  
  const totalCards = cardsInLevel.length; // Change this line
  
  //console.log('CategoryCounts:', categoryCounts);
  //console.log('TotalCards:', totalCards);
  function updateCardCategory(wasCorrect: boolean) {
    setFlashcards(cards =>
      cards.map((card) => {
        if (card.id !== currentCard?.id) return card;
  
        let newReviewCount = card.reviewCount;
        let isNew = card.isNew;
  
        if (!wasCorrect && card.category === 'mastered') {
          newReviewCount = 3;  // Reset to beginning of reviewing
          isNew = false;
        } else if (card.isNew) {
          // New Word → Mastered or Learning
          if (wasCorrect) {
            newReviewCount = 7; // Directly moves to Mastered
            isNew = false;
          } else {
            newReviewCount = 1; // Moves to Learning
            isNew = false;
          }
        } else if (newReviewCount < 3) {
          // Learning → Reviewing
          if (wasCorrect) {
            newReviewCount += 1;
          } else {
            newReviewCount = Math.max(0, newReviewCount - 1); // Reset to Learning if failed
          }
        } else if (newReviewCount >= 3 && newReviewCount < 7) {
          // Reviewing → Mastered
          if (wasCorrect) {
            newReviewCount += 1;
          } else {
            newReviewCount = 3; // Reset to the beginning of Reviewing
          }
        }
  
        // Determine the new category
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
      } while (
        shuffledIndex === lastShownIndex && 
        filteredCards.length > 1
      );
      
      setLastShownIndex(shuffledIndex);
      return shuffledIndex;
    });
  
    setIsFlipped(false);
  }


  return (
    <div className="min-h-screen bg-purple-900 text-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">German Vocabulary Flashcards</h1>

        <LevelSelector onLevelChange={(selectedLevel) => setLevel(selectedLevel)} />

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

        <ProgressBar
          mastered={categoryCounts.Mastered}
          learning={categoryCounts.Learning}
          reviewing={categoryCounts.Reviewing}
          total={totalCards}
        />

        <ProgressTracker
          categoryCounts={categoryCounts}
          totalCards={totalCards}
        />
      </div>
    </div>
  );
}

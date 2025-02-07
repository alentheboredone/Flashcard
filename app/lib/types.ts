import { z } from "zod";

export const CardCategory = z.enum(['mastered', 'learning', 'reviewing']);
export const CardLevel = z.string();

export const FlashCardSchema = z.object({
  id: z.string(),
  german: z.string(),
  english: z.string(),
  example: z.string(),
  category: CardCategory,
  level: CardLevel,
  // If you previously had a "set" field, it is now removed.
});

// Extend the flashcard schema to include session state fields.
// A new field "interval" is added for spaced repetition purposes.
export const FlashCardWithStateSchema = FlashCardSchema.extend({
  reviewCount: z.number(),  // Optional: if you still want to track review counts
  interval: z.number(),     // New field for the review interval (e.g., in review turns)
  isNew: z.boolean(),
  lastShown: z.number(),
});

console.log('Exporting FlashCardWithStateSchema:', FlashCardWithStateSchema);

export type FlashCard = z.infer<typeof FlashCardSchema>;
export type FlashCardWithState = z.infer<typeof FlashCardWithStateSchema>;

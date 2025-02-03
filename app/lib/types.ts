import { z } from "zod";

export const CardCategory = z.enum(['mastered', 'learning', 'reviewing']);
//export const CardSet = z.enum(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21']);
export const CardLevel = z.string();

export const FlashCardSchema = z.object({
  id: z.string(),
  german: z.string(),
  english: z.string(),
  example: z.string(),
  category: CardCategory,
  //set: CardSet,
  level: CardLevel,
});

export const FlashCardWithStateSchema = FlashCardSchema.extend({
  reviewCount: z.number(),
  isNew: z.boolean(),
  lastShown: z.number(),
});
console.log('Exporting FlashCardWithStateSchema:', FlashCardWithStateSchema);


export type FlashCard = z.infer<typeof FlashCardSchema>;
export type FlashCardWithState = z.infer<typeof FlashCardWithStateSchema>;
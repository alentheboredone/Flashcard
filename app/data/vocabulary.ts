import { z } from "zod";
import { query } from "./db"; // Import the query function from db.ts

// Define your enums and schema
export const CardCategory = z.enum(['mastered', 'learning', 'reviewing']);
export const CardSet = z.enum(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21']);
export const CardLevel = z.enum(["B1.1 (1-30)",
  "B1.1 (31-60)",
  "B1.1 (61-90)",
  "B1.1 (91-120)",
  "B1.1 (121-150)",
  "B1.1 (151-180)",
  "B1.1 (181-210)",
  "B1.1 (211-240)",
  "B1.1 (241-270)",
  "B1.1 (271-300)",
  "B1.1 (301-330)",
  "B1.1 (331-360)",
  "B1.1 (361-390)",
  "B1.1 (391-420)",
  "B1.1 (421-450)",
  "B1.1 (451-480)",
  "B1.1 (481-510)",
  "B1.1 (511-540)",
  "B1.1 (541-570)",
  "B1.1 (571-579)"]);

export const FlashCardSchema = z.object({
  id: z.string(),
  german: z.string(),
  english: z.string(),
  example: z.string(),
  category: CardCategory,
  set: CardSet,
  level: CardLevel,
});

export type FlashCard = z.infer<typeof FlashCardSchema>;

// Fetch data from PostgreSQL
export const getVocabulary = async (): Promise<FlashCard[]> => {
  const queryText = `
    SELECT 
      id::text, 
      "Deutsch" AS german, 
      "Englisch" AS english, 
      "Beispielsatz" AS example, 
      "category", 
      set_number::text AS set, 
      level
    FROM public.german_words
    ORDER BY id;
  `;

  const rows = await query(queryText);

  // Validate the data using the schema
  return rows.map((row) => FlashCardSchema.parse({
    ...row,
    set: row.set || 'learning', // Handle default set value
  }));
};

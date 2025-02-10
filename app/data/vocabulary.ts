import { z } from "zod";
import { query } from "./db"; // Import the query function from db.ts

// Define your enums and schema
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

export type FlashCard = z.infer<typeof FlashCardSchema>;



// Fetch data from PostgreSQL
export const getVocabulary = async (level: string, limit: number = 30, offset: number = 0): Promise<FlashCard[]> => {
  console.log("getVocabulary -> Searching for level:", level);
  const queryText = `
    SELECT 
      id::text, 
      "Deutsch" AS german, 
      "Englisch" AS english, 
      "Beispielsatz" AS example, 
      "category", 
      level
    FROM public.german_words
    WHERE level = $1
    ORDER BY id
    LIMIT $2 OFFSET $3;
  `;

  const rows = await query(queryText, [level, limit,offset]);

  // Validate the data using the schema
  return rows.map((row) => FlashCardSchema.parse({
    ...row,
    //set: row.set || 'learning', // Handle default set value
  }));
};
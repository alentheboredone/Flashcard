// Mark this file as server-side only
'use server'

import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();


// Create a connection pool for PostgreSQL
//const pool = new Pool({
//user: 'postgres', // Replace with your PostgreSQL username
//host: 'localhost',     // Replace with your PostgreSQL host
//database: 'German words', // Replace with your PostgreSQL database name
//password: 'Postgres@94341', // Replace with your PostgreSQL password
/*port: 5432,            // Replace with your PostgreSQL port if different
});
console.log('Database User:',  process.env.DATABASE_USER);
console.log('Database Password:', process.env.DATABASE_PASSWORD); // Debug only, remove after testing*/

// Configure the database connection dynamically based on environment variables
const pool = new Pool({
  host: process.env.DATABASE_HOST, // From environment variable
  port: parseInt(process.env.DATABASE_PORT || '5432'), // Default port is 5432
  user: process.env.DATABASE_USER, // From environment variable
  password: process.env.DATABASE_PASSWORD, // From environment variable
  database: process.env.DATABASE_NAME || 'postgres', // Default to 'postgres' if not set
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Needed for Supabase SSL connections
  },
});

console.log('Connecting to:', process.env.DATABASE_URL);

// Export the query function for use in other files
export const query = async (text: string, params?: any[]) => {
  console.log('Executing query:', text);
  console.log('With params:', params);
  try {
    const res = await pool.query(text, params);
    console.log('Query result:', res.rows);
    return res.rows;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error executing query', err.stack);
    }
    throw err;
  }
};

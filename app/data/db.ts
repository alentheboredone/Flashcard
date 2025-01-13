// Mark this file as server-side only
'use server'

import { Pool } from 'pg';

// Create a connection pool for PostgreSQL
const pool = new Pool({
  user: 'postgres', // Replace with your PostgreSQL username
  host: 'localhost',     // Replace with your PostgreSQL host
  database: 'German words', // Replace with your PostgreSQL database name
  password: 'Postgres@94341', // Replace with your PostgreSQL password
  port: 5432,            // Replace with your PostgreSQL port if different
});

// Export the query function for use in other files
export const query = async (text: string, params?: any[]) => {
  try {
    const res = await pool.query(text, params);
    return res.rows;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error executing query', err.stack);
    }
    throw err;
  }
};

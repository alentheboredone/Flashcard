// app/api/levels/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configure your connection pool using environment variables.
// For local development, ensure DATABASE_URL points to your local PostgreSQL instance.
//const pool = new Pool({
//  connectionString: process.env.DATABASE_URL,
  // If running locally (without SSL) you can disable SSL; in production (Supabase) you likely need SSL.
//  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
//});
// Create a connection pool for PostgreSQL
const pool = new Pool({
    user: 'postgres', // Replace with your PostgreSQL username
    host: 'localhost',     // Replace with your PostgreSQL host
    database: 'German words', // Replace with your PostgreSQL database name
    password: 'Postgres@94341', // Replace with your PostgreSQL password
    port: 5432,            // Replace with your PostgreSQL port if different
    });
    console.log('Database User:',  process.env.DATABASE_USER);
    console.log('Database Password:', process.env.DATABASE_PASSWORD); // Debug only, remove after testing


export async function GET(request: Request) {
  // Optionally, allow filtering by baseLevel (e.g. "B1.1") via a query parameter.
  const { searchParams } = new URL(request.url);
  const baseLevel = searchParams.get('baseLevel');

  try {
    let query = 'SELECT DISTINCT level FROM german_words';
    let params: any[] = [];
    if (baseLevel) {
      // Use parameterized queries to prevent SQL injection.
      query += ' WHERE level LIKE $1';
      params.push(`${baseLevel}%`);
    }

    const result = await pool.query(query, params);
    // result.rows is an array of objects like { level: "B1.1 (31-60)" }
    const levels = result.rows.map((row) => row.level);

    return NextResponse.json({ levels });
  } catch (error) {
    console.error('Error fetching levels:', error);
    return NextResponse.error();
  }
}

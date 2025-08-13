import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // masukkan URI supabase di .env
  ssl: {
    rejectUnauthorized: false, // Supabase pakai SSL
  },
});

export default pool;

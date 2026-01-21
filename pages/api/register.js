// pages/api/register.js
import pool from "../../lib/db";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username & password required" });
  }

  try {
    // cek apakah username sudah terdaftar
    const existing = await pool.query("SELECT id FROM users WHERE username=$1", [username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Username already registered" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // insert user baru
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, hashed]
    );

    const user = result.rows[0];
    res.status(201).json({ id: user.id, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}

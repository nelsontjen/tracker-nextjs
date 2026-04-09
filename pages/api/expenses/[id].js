import pool from "../../../lib/db";
import jwt from "jsonwebtoken";

// Helper untuk verifikasi JWT dan ambil userId
function getUserId(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const { id } = req.query;

  // Semua method di sini butuh autentikasi
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "DELETE") {
    try {
      // Pastikan expense ini milik user yang sedang login
      const result = await pool.query(
        "DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id",
        [id, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Expense not found or not authorized" });
      }

      res.status(200).json({ message: "Deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }

  } else if (req.method === "PUT") {
    const { description, amount, date } = req.body;

    if (!description || !amount) {
      return res.status(400).json({ error: "Description and amount are required" });
    }

    try {
      // Pastikan expense ini milik user yang sedang login
      const result = await pool.query(
        `UPDATE expenses
         SET description = $1, amount = $2, date = $3
         WHERE id = $4 AND user_id = $5
         RETURNING *`,
        [description, amount, date || new Date(), id, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Expense not found or not authorized" });
      }

      const updated = result.rows[0];
      res.status(200).json({ ...updated, amount: Number(updated.amount) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }

  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

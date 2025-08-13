import pool from "../../../lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      await pool.query("DELETE FROM expenses WHERE id = $1", [id]);
      res.status(200).json({ message: "Deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

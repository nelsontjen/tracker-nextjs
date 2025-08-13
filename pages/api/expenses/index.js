import pool from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT * FROM expenses ORDER BY date ASC");
      const rows = result.rows.map(row => ({
        ...row,
        amount: Number(row.amount)
      }));

      res.status(200).json(rows);
    //   res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  } else if (req.method === "POST") {
    const { description, amount, date } = req.body;
    if (!description || !amount) {
      return res.status(400).json({ error: "Missing description or amount" });
    }

    try {
      const result = await pool.query(
        "INSERT INTO expenses (description, amount, date) VALUES ($1, $2, $3) RETURNING *",
        [description, amount, date || new Date()]
      );
      // convert amount saat insert juga
      const insertedRow = {
        ...result.rows[0],
        amount: Number(result.rows[0].amount)
      };

      res.status(201).json(insertedRow);
    //   res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

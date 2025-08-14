import pool from "../../../lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    let userId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }

    if (req.method === "GET") {
        try {
            const { month, year, limit, offset } = req.query;

            let query = "SELECT * FROM expenses WHERE user_id=$1";
            let params = [userId];
            let paramIndex = 2;

            if (year) {
                query += ` AND EXTRACT(YEAR FROM date) = $${paramIndex++}`;
                params.push(Number(year));
            }

            if (month && month !== "all") {
                query += ` AND EXTRACT(MONTH FROM date) = $${paramIndex++}`;
                params.push(Number(month));
            }

            query += " ORDER BY date DESC";

            if (limit) {
                query += ` LIMIT $${paramIndex++}`;
                params.push(Number(limit));
            }
            if (offset) {
                query += ` OFFSET $${paramIndex++}`;
                params.push(Number(offset));
            }

            const result = await pool.query(query, params);
            res.status(200).json(result.rows.map(r => ({ ...r, amount: Number(r.amount) })));
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Database error" });
        }
    }
    else if (req.method === "POST") {
        const { description, amount, date } = req.body;
        if (!description || !amount) return res.status(400).json({ error: "Missing data" });

        try {
            const result = await pool.query(
                "INSERT INTO expenses (description, amount, date, user_id) VALUES ($1,$2,$3,$4) RETURNING *",
                [description, amount, date || new Date(), userId]
            );
            res.status(201).json({ ...result.rows[0], amount: Number(result.rows[0].amount) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Database error" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

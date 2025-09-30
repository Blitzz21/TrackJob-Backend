import { Request, Response } from "express";
import pool from "../config/db";

// CREATE job
export const createJob = async (req: Request, res: Response) => {
  try {
    const { company, position, status, applied_date, follow_up_date } = req.body;
    const userId = (req as any).user?.id;

    if (!company) return res.status(400).json({ error: "Company is required" });
    if (!position) return res.status(400).json({ error: "Position is required" });

    await pool.query(
      "INSERT INTO jobs (user_id, company, position, status, applied_date, follow_up_date) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, company, position, status || "applied", applied_date || null, follow_up_date || null]
    );

    res.status(201).json({ message: "Job added successfully ✅" });
  } catch (err: any) {
    console.error("❌ Create job error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};



// READ jobs (all for logged-in user)
export const getJobs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [jobs]: any = await pool.query(
      "SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.json(jobs);
  } catch (err: any) {
    console.error("❌ Get jobs error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};


// UPDATE job
export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { company, position, status, applied_date, follow_up_date } = req.body;
    const userId = (req as any).user.id;

    const [result]: any = await pool.query(
      "UPDATE jobs SET company=?, position=?, status=?, applied_date=?, follow_up_date=? WHERE id=? AND user_id=?",
      [company, position, status, applied_date, follow_up_date, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found or not authorized" });
    }

    res.json({ message: "Job updated successfully ✅" });
  } catch (err: any) {
    console.error("❌ Update job error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};



// DELETE job
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const [result]: any = await pool.query(
      "DELETE FROM jobs WHERE id=? AND user_id=?",
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found or not authorized" });
    }

    res.json({ message: "Job deleted successfully 🗑️" });
  } catch (err: any) {
    console.error("❌ Delete job error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const getFollowUps = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [followUps]: any = await pool.query(
      "SELECT * FROM jobs WHERE user_id = ? AND follow_up_date IS NOT NULL AND follow_up_date >= CURDATE() ORDER BY follow_up_date ASC",
      [userId]
    );

    res.json(followUps);
  } catch (err: any) {
    console.error("❌ Get follow-ups error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
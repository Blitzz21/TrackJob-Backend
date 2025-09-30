import { Request, Response } from "express";
import pool from "../config/db";

// CREATE job
export const createJob = async (req: Request, res: Response) => {
  try {
    const { company, position, email, status, applied_date, follow_up_date } = req.body;
    const userId = (req as any).user?.id;

    if (!company) return res.status(400).json({ error: "Company is required" });
    if (!position) return res.status(400).json({ error: "Position is required" });
    if (!email) return res.status(400).json({ error: "Email is required" });

    await pool.query(
      "INSERT INTO jobs (user_id, company, position, email, status, applied_date, follow_up_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        company,
        position,
        email,
        status || "applied",
        applied_date || null,
        follow_up_date || null,
      ]
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
    const { company, position, status, applied_date } = req.body; // removed follow_up_date
    const userId = (req as any).user.id;

    const [result]: any = await pool.query(
      "UPDATE jobs SET company=?, position=?, status=?, applied_date=? WHERE id=? AND user_id=?",
      [company, position, status, applied_date || null, id, userId]
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



// FOLLOW-UP update (status, follow-up date, optional email content)
export const updateJobFollowUp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { follow_up_date, status, emailContent } = req.body; 
    const userId = (req as any).user.id;

    const [result]: any = await pool.query(
      "UPDATE jobs SET follow_up_date=?, status=? WHERE id=? AND user_id=?",
      [follow_up_date || null, status || "applied", id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found or not authorized" });
    }

    // Optional: Store follow-up emails in a separate table for history
    // await pool.query("INSERT INTO followups (job_id, user_id, content) VALUES (?, ?, ?)", [id, userId, emailContent]);

    res.json({ message: "Follow-up updated successfully ✅" });
  } catch (err: any) {
    console.error("❌ Follow-up update error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// CREATE a follow-up
export const createFollowUp = async (req: Request, res: Response) => {
  try {
    const { job_id, follow_up_date, type, content } = req.body;
    const userId = (req as any).user.id;

    if (!job_id || !follow_up_date) {
      return res.status(400).json({ error: "Job ID and follow-up date are required" });
    }

    await pool.query(
      "INSERT INTO followups (job_id, user_id, follow_up_date, type, content) VALUES (?, ?, ?, ?, ?)",
      [job_id, userId, follow_up_date, type || "email", content || null]
    );

    res.status(201).json({ message: "Follow-up created successfully ✅" });
  } catch (err: any) {
    console.error("❌ Create follow-up error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// GET all follow-ups for a job
export const getFollowUpsByJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const userId = (req as any).user.id;

    const [followups]: any = await pool.query(
      "SELECT * FROM followups WHERE job_id = ? AND user_id = ? ORDER BY follow_up_date DESC",
      [jobId, userId]
    );

    res.json(followups);
  } catch (err: any) {
    console.error("❌ Get follow-ups error:", err.message);
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
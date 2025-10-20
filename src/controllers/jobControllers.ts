import { Request, Response } from "express";
import pool from "../config/db"; 
import nodemailer from "nodemailer";

/* ============================================================
   CREATE JOB (No auto follow-up)
   ============================================================ */
export const createJob = async (req: Request, res: Response) => {
  try {
    const { company, position, email, status, applied_date } = req.body;
    const userId = (req as any).user?.id;

    if (!company) return res.status(400).json({ error: "Company is required" });
    if (!position) return res.status(400).json({ error: "Position is required" });
    if (!email) return res.status(400).json({ error: "Email is required" });

    const appliedDate = applied_date ? applied_date.split("T")[0] : null;

    await pool.query(
      `INSERT INTO jobs (user_id, company, position, email, status, applied_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, company, position, email, status || "applied", appliedDate]
    );

    res.status(201).json({ message: "Job added successfully ✅" });
  } catch (err: any) {
    console.error("❌ Create job error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

/* ============================================================
   READ JOBS (All for logged-in user)
   ============================================================ */
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

/* ============================================================
   UPDATE JOB
   ============================================================ */
export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { company, position, status, applied_date, email } = req.body;
    const userId = (req as any).user.id;

    const appliedDate = applied_date ? applied_date.split("T")[0] : null;

    const [result]: any = await pool.query(
      `UPDATE jobs 
       SET company=?, position=?, status=?, applied_date=?, email=? 
       WHERE id=? AND user_id=?`,
      [company, position, status, appliedDate, email, id, userId]
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

/* ============================================================
   UPDATE JOB FOLLOW-UP (Status / Follow-up date)
   ============================================================ */
export const updateJobFollowUp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { follow_up_date, status } = req.body;
    const userId = (req as any).user.id;

    const formattedDate = follow_up_date
      ? new Date(follow_up_date).toISOString().split("T")[0]
      : null;

    const [result]: any = await pool.query(
      "UPDATE jobs SET follow_up_date = ?, status = ? WHERE id = ? AND user_id = ?",
      [formattedDate, status || "applied", id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found or not authorized" });
    }

    res.json({ message: "Follow-up updated successfully ✅" });
  } catch (err: any) {
    console.error("❌ Follow-up update error:", err.message);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

/* ============================================================
   CREATE FOLLOW-UP (Manual or Scheduled)
   ============================================================ */
export const createFollowUp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // job ID
    const { follow_up_date, type, content, sendNow } = req.body;
    const userId = (req as any).user.id;

    if (!id) return res.status(400).json({ error: "Job ID is required" });

    // 🧠 If sendNow is true, set follow_up_date to today's date
    const formattedDate = sendNow
      ? new Date().toISOString().split("T")[0]
      : follow_up_date?.split("T")[0];

    if (!formattedDate)
      return res.status(400).json({ error: "Follow-up date is required" });

    // ✅ Insert into followups table
    await pool.query(
      "INSERT INTO followups (job_id, user_id, follow_up_date, type, content) VALUES (?, ?, ?, ?, ?)",
      [id, userId, formattedDate, type || "email", content || null]
    );

    // ✅ Update job's follow-up date
    await pool.query("UPDATE jobs SET follow_up_date = ? WHERE id = ?", [
      formattedDate,
      id,
    ]);

    // 📨 If sendNow is true, actually send the email
    if (sendNow) {
      // 1️⃣ Get job info
      const [[job]]: any = await pool.query(
        "SELECT company, email, position FROM jobs WHERE id = ?",
        [id]
      );

      if (!job) return res.status(404).json({ error: "Job not found" });

      // 2️⃣ Get user's saved email credentials
      const [[settings]]: any = await pool.query(
        "SELECT email, encrypted_password FROM email_settings WHERE user_id = ?",
        [userId]
      );

      if (!settings)
        return res
          .status(400)
          .json({ error: "Please save your email settings first." });

      // 3️⃣ Send email via Nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: settings.email,
          pass: settings.encrypted_password, // ✅ fixed column name
        },
      });

      await transporter.sendMail({
        from: settings.email_address,
        to: job.email,
        subject: `Follow-up on ${job.position} at ${job.company}`,
        text:
          content ||
          `Hi ${job.company},\n\nJust following up regarding my application for the ${job.position} position.\n\nBest regards,\n[Your Name]`,
      });

      console.log("✅ Follow-up email sent successfully!");
    }

    res.status(201).json({
      message: sendNow
        ? "Follow-up email sent successfully ✅"
        : "Follow-up scheduled successfully 📅",
    });
  } catch (err: any) {
    console.error("❌ Create follow-up error:", err.message);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

/* ============================================================
   GET FOLLOW-UPS FOR SPECIFIC JOB
   ============================================================ */
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

/* ============================================================
   DELETE JOB
   ============================================================ */
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

/* ============================================================
   GET ALL FOLLOW-UPS (JOIN WITH JOBS)
   ============================================================ */
export const getFollowUps = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [followUps]: any = await pool.query(
      `SELECT f.id, f.follow_up_date, f.type, f.content,
              j.company, j.email, j.position
       FROM followups f
       JOIN jobs j ON f.job_id = j.id
       WHERE f.user_id = ?
       ORDER BY f.follow_up_date DESC`,
      [userId]
    );

    res.json(followUps);
  } catch (err: any) {
    console.error("❌ Get follow-ups error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

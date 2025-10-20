import { Request, Response } from "express";
import { Resend } from "resend";
import pool from "../config/db";

const resend = new Resend(process.env.RESEND_API_KEY);

// === Save Email Settings ===
export const saveEmailSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    await pool.query(
      `INSERT INTO email_settings (user_id, email)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE email=?`,
      [userId, email, email]
    );

    res.status(200).json({ message: "Email settings saved ✅" });
  } catch (err: any) {
    console.error("❌ Save email settings error:", err.message);
    res.status(500).json({ error: "Failed to save email settings" });
  }
};

// === Get Email Settings ===
export const getEmailSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const [rows]: any = await pool.query(
      "SELECT email FROM email_settings WHERE user_id = ?",
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "No email settings found" });
    }

    res.json(rows[0]);
  } catch (err: any) {
    console.error("❌ Get email settings error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// === Send Test Email (using Resend) ===
export const sendTestEmail = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { to, subject, message } = req.body;

    const [rows]: any = await pool.query(
      "SELECT email FROM email_settings WHERE user_id = ?",
      [userId]
    );

    if (!rows.length) {
      return res.status(400).json({ error: "Please set up email settings first." });
    }

    const { email } = rows[0];

    await resend.emails.send({
      from: `${email}`,
      to,
      subject: subject || "Follow-up Message",
      text: message || "This is a test email from your Job Tracker app!",
    });

    res.status(200).json({ message: "✅ Test email sent successfully via Resend" });
  } catch (err: any) {
    console.error("❌ Send test email error:", err.message);
    res.status(500).json({ error: "Failed to send email" });
  }
};

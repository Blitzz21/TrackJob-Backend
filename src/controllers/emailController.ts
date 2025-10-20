import { Request, Response } from "express";
import nodemailer from "nodemailer";
import pool from "../config/db";

/* ============================================================
   SAVE EMAIL SETTINGS (with encrypted password)
   ============================================================ */
export const saveEmailSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { email, encryptedPassword } = req.body;

    if (!email || !encryptedPassword) {
      return res.status(400).json({ error: "Email and encrypted password are required" });
    }

    await pool.query(
      `INSERT INTO email_settings (user_id, email, encrypted_password)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE email=?, encrypted_password=?`,
      [userId, email, encryptedPassword, email, encryptedPassword]
    );

    res.status(200).json({ message: "Email settings saved ✅" });
  } catch (err: any) {
    console.error("❌ Save email settings error:", err.message);
    res.status(500).json({ error: "Failed to save email settings" });
  }
};

/* ============================================================
   GET EMAIL SETTINGS
   ============================================================ */
export const getEmailSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const [rows]: any = await pool.query(
      "SELECT email, encrypted_password FROM email_settings WHERE user_id = ?",
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

/* ============================================================
   SEND TEST EMAIL (using saved credentials)
   ============================================================ */
export const sendTestEmail = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { to, subject, message } = req.body;

    const [rows]: any = await pool.query(
      "SELECT email, encrypted_password FROM email_settings WHERE user_id = ?",
      [userId]
    );

    if (!rows.length) {
      return res.status(400).json({ error: "Please set up email settings first." });
    }

    const { email, encrypted_password } = rows[0];

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass: encrypted_password, // use correct column
      },
    });

    await transporter.sendMail({
      from: email,
      to,
      subject,
      text: message,
    });

    res.status(200).json({ message: "Test email sent successfully ✅" });
  } catch (err: any) {
    console.error("❌ Send test email error:", err.message);
    res.status(500).json({ error: "Failed to send email" });
  }
};

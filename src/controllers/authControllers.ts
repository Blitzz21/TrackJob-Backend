import { Request, Response } from "express";
import pool from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user exists
    const [existing]: any = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully ✅" });
  } catch (err: any) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password, remember } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find user
    const [rows]: any = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ JWT expiry changes if "remember me" is checked
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: remember ? "30d" : "1h",
      }
    );

    res.json({ message: "Login successful ✅", token });
  } catch (error: any) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email, currentPassword, newPassword } = req.body;

    const [user]: any = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (user.length === 0) return res.status(404).json({ error: "User not found" });

    // Verify password if changing it
    if (newPassword) {
      const valid = await bcrypt.compare(currentPassword, user[0].password);
      if (!valid) return res.status(400).json({ error: "Current password is incorrect" });
      const hashed = await bcrypt.hash(newPassword, 10);
      await pool.query("UPDATE users SET name=?, email=?, password=? WHERE id=?", [name, email, hashed, userId]);
    } else {
      await pool.query("UPDATE users SET name=?, email=? WHERE id=?", [name, email, userId]);
    }

    res.json({ message: "Profile updated successfully ✅" });
  } catch (err: any) {
    console.error("❌ Update profile error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
// Additional controllers like getUserProfile can be added here
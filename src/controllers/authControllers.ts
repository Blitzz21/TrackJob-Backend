import pool from "../config/db";
import { Request, Response } from "express";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Insert into MySQL
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );

    res.status(201).json({ message: "User registered successfully ✅" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
};

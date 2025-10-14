import pool from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { findUserByEmail, createUser } from "../models/userModel.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

export const signup = async (req, res) => {
  const { name, email, password, timezone } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const existing = await findUserByEmail(email);
    if (existing)
      return res.status(409).json({ error: "Email already registered" });

    const tenantRes = await pool.query(
      "INSERT INTO tenants(name) VALUES($1) RETURNING tenant_id",
      [name || email.split("@")[0]]
    );
    const tenantId = tenantRes.rows[0].tenant_id;

    const hashed = await hashPassword(password);
    const user = await createUser(tenantId, name, email, hashed, timezone);

    const payload = {
      user_id: user.user_id,
      tenant_id: user.tenant_id,
      role: user.role,
      email: user.email,
    };

    const refreshToken = generateRefreshToken(payload);

    await pool.query("UPDATE users SET refresh_token=$1 WHERE user_id=$2", [
      refreshToken,
      user.user_id,
    ]);

    res.status(201).json({ user, refresh_token: refreshToken });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await comparePassword(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const payload = {
      user_id: user.user_id,
      tenant_id: user.tenant_id,
      role: user.role,
      email: user.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await pool.query("UPDATE users SET refresh_token=$1 WHERE user_id=$2", [
      refreshToken,
      user.user_id,
    ]);

    delete user.password;
    delete user.refresh_token;
    res
      .status(200)
      .json({ user, access_token: accessToken, refresh_token: refreshToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token)
    return res.status(400).json({ error: "Refresh token required" });

  try {
    const decoded = verifyRefreshToken(refresh_token);
    const user = await findUserByEmail(decoded.email);
    if (!user) return res.status(401).json({ error: "Invalid refresh token" });

    if (user.refresh_token !== refresh_token)
      return res.status(401).json({ error: "Token mismatch or expired" });

    const newAccessToken = generateAccessToken({
      user_id: user.user_id,
      tenant_id: user.tenant_id,
      role: user.role,
      email: user.email,
    });

    // Optional: rotate refresh token (recommended)
    const newRefreshToken = generateRefreshToken({
      user_id: user.user_id,
      tenant_id: user.tenant_id,
      role: user.role,
      email: user.email,
    });

    await pool.query("UPDATE users SET refresh_token=$1 WHERE user_id=$2", [
      newRefreshToken,
      user.user_id,
    ]);

    res.status(200).json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

export const logout = async (req, res) => {
  try {
    const { user_id } = req.user;
    await pool.query("UPDATE users SET refresh_token=NULL WHERE user_id=$1", [
      user_id,
    ]);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal Server error" });
  }
};

export const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    const payload = {
      user_id: user.user_id,
      tenant_id: user.tenant_id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await pool.query("UPDATE users SET refresh_token=$1 WHERE user_id=$2", [
      refreshToken,
      user.user_id,
    ]);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // TOOD: Change the URL to your frontend when the the callback is successful
    res.redirect(`${process.env.FRONTEND_URL}/`);
  } catch (err) {
    console.error("Google callback error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import { sendViaMandrill } from "./mailchimp.controller.js";

dotenv.config();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

// Customer signup
export const signup = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ msg: "Missing fields" });
    const normalizedEmail = String(email).toLowerCase().trim();
    console.log('[signup] normalized email:', normalizedEmail);
    let user = await User.findOne({ email: { $regex: `^${normalizedEmail}$`, $options: 'i' } });
    if (user) {
      console.log('[signup] user already exists:', normalizedEmail);
      return res.status(400).json({ msg: "User exists" });
    }
    user = await User.create({ fullName, email: normalizedEmail, phone, password });
    console.log('[signup] user created:', user._id, 'email:', user.email);
    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, fullName: user.fullName, email: user.email } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Customer login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();
    console.log('[login] attempting with email:', normalizedEmail);
    const user = await User.findOne({ email: { $regex: `^${normalizedEmail}$`, $options: 'i' } });
    if (!user) {
      console.log('[login] user not found for email:', normalizedEmail);
      return res.status(401).json({ msg: "Invalid credentials" });
    }
    console.log('[login] user found:', user._id, 'stored email:', user.email);
    const isMatch = await user.matchPassword(password);
    console.log('[login] password match result:', isMatch);
    if (!isMatch) {
      console.log('[login] password mismatch for user:', user._id);
      return res.status(401).json({ msg: "Invalid credentials" });
    }
    const token = signToken(user._id);
    console.log('[login] token generated for user:', user._id);
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();
    console.log('[adminLogin] attempting with email:', normalizedEmail);
    const admin = await Admin.findOne({ email: { $regex: `^${normalizedEmail}$`, $options: 'i' } });
    if (!admin) {
      console.log('[adminLogin] admin not found for email:', normalizedEmail);
      return res.status(401).json({ msg: "Invalid admin credentials" });
    }
    console.log('[adminLogin] admin found:', admin._id, 'stored email:', admin.email);
    const isMatch = await admin.matchPassword(password);
    console.log('[adminLogin] password match result:', isMatch);
    if (!isMatch) {
      console.log('[adminLogin] password mismatch for admin:', admin._id);
      return res.status(401).json({ msg: "Invalid admin credentials" });
    }
    const token = signToken(admin._id);
    console.log('[adminLogin] token generated for admin:', admin._id);
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Verify current session (returns user/admin from token)
export const me = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token" });
    
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if admin
    let admin = await Admin.findById(payload.id).select("-password");
    if (admin) {
      return res.json({ 
        role: "admin", 
        admin: { id: admin._id, name: admin.name, email: admin.email } 
      });
    }
    
    // Check if user
    let user = await User.findById(payload.id).select("-password");
    if (user) {
      return res.json({ 
        role: "user", 
        user: { id: user._id, fullName: user.fullName, email: user.email } 
      });
    }
    
    return res.status(401).json({ msg: "User not found" });
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

// ─── Forgot Password ───────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ msg: "Email is required" });

    const user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });

    // Always return 200 to prevent email enumeration
    if (!user) {
      console.log('[forgotPassword] no user found for:', email);
      return res.json({ success: true, msg: "If that email exists, a reset link was sent." });
    }

    // Generate a secure random token and set 1-hour expiry
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateModifiedOnly: true });

    // Build reset URL – rawToken goes to the user, hashed version stays in DB
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    // Send email via Mandrill (Mailchimp Transactional)
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #33343B; margin-bottom: 8px;">Password Reset Request</h2>
        <p style="color: #48547C; font-size: 14px;">
          Hi <strong>${user.fullName}</strong>,
        </p>
        <p style="color: #48547C; font-size: 14px;">
          We received a request to reset the password for your account. Click the button below to set a new password:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #749DD0; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
            Reset Password
          </a>
        </div>
        <p style="color: #999; font-size: 12px;">
          This link will expire in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #bbb; font-size: 11px; text-align: center;">
          The Bush Collection &bull; thebushcollection.africa
        </p>
      </div>
    `;

    await sendViaMandrill({
      to: user.email,
      toName: user.fullName,
      subject: 'Reset Your Password – The Bush Collection',
      html,
      text: `Hi ${user.fullName},\n\nReset your password using this link (expires in 1 hour):\n${resetUrl}\n\nIf you did not request this, please ignore this email.`
    });

    console.log('[forgotPassword] reset email sent to:', user.email);
    res.json({ success: true, msg: "If that email exists, a reset link was sent." });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ─── Reset Password ─────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ msg: "Token and new password are required" });
    if (password.length < 6) return res.status(400).json({ msg: "Password must be at least 6 characters" });

    // Hash the incoming raw token to compare against the stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired reset token" });
    }

    // Set new password (the pre-save hook will bcrypt it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('[resetPassword] password updated for user:', user._id);
    res.json({ success: true, msg: "Password has been reset successfully" });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

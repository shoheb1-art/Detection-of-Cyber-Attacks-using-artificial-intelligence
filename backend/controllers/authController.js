const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!(name && email && password)) return res.status(400).send("All input is required");

        const verificationCode = generateVerificationCode();
        const expires = new Date(Date.now() + 600000); // 10 minutes from now
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.query(
            'INSERT INTO users (name, email, password, member_since, is_verified, verification_token, reset_token_expires) VALUES (?, ?, ?, CURDATE(), ?, ?, ?)',
            [name, email, hashedPassword, false, verificationCode, expires]
        );
        
        sendVerificationEmail(name, email, verificationCode);
        res.status(201).send("Registration successful. Please check your email for a verification code.");
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).send("User with this email already exists.");
        console.error(err);
        res.status(500).json({ error: "An error occurred during registration." });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!(email && password)) return res.status(400).send("All input is required");

        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (user && (await bcrypt.compare(password, user.password))) {
            // The is_verified check has been removed. User can log in.

            await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
            const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "2h" });
            return res.status(200).json({ token });
        }
        res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred during login." });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND verification_token = ? AND reset_token_expires > NOW()', [email, code]);
        const user = rows[0];

        if (!user) {
            return res.status(400).send("Invalid or expired verification code.");
        }

        await db.query('UPDATE users SET is_verified = TRUE, verification_token = NULL, reset_token_expires = NULL WHERE id = ?', [user.id]);
        res.status(200).send("Email verified successfully. You can now log in.");
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred during verification." });
    }
};

exports.resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        const newCode = generateVerificationCode();
        const newExpires = new Date(Date.now() + 600000); // 10 minutes

        await db.query('UPDATE users SET verification_token = ?, reset_token_expires = ? WHERE email = ?', [newCode, newExpires, email]);
        
        const [rows] = await db.query('SELECT name FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if(user) {
            sendVerificationEmail(user.name, email, newCode);
        }
        res.status(200).send("A new verification code has been sent to your email.");
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred." });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(200).send("If an account with that email exists, a password reset link has been sent.");
        }

        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await db.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [hashedToken, expires, user.id]);

        const resetLink = `http://localhost:5173/reset-password/${token}`;
        await sendPasswordResetEmail(user.email, resetLink);
        res.status(200).send("If an account with that email exists, a password reset link has been sent.");

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred." });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!password || !token) {
            return res.status(400).send("Token and new password are required.");
        }
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        const [rows] = await db.query(
            'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
            [hashedToken]
        );
        const user = rows[0];

        if (!user) {
            return res.status(400).send("Password reset token is invalid or has expired.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.status(200).send("Password has been updated successfully.");

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred." });
    }
};
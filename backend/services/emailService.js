const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// The function for sending password reset emails
const sendPasswordResetEmail = (email, resetLink) => {
    const mailOptions = {
        to: email,
        from: process.env.EMAIL_USER,
        subject: 'Password Reset Request',
        html: `<p>Please click the following link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
    };
    return transporter.sendMail(mailOptions);
};

// The function for sending new user verification emails
const sendVerificationEmail = (name, email, verificationCode) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Verification Code',
        html: `
            <h1>Hello ${name},</h1>
            <p>Thank you for registering. Please use the following code to verify your email address and activate your account:</p>
            <h2 style="text-align: center; color: #333;">${verificationCode}</h2>
            <p>This code will expire in 10 minutes.</p>
        `
    };
    transporter.sendMail(mailOptions, (error) => {
        if (error) console.error("Error sending verification email: ", error);
    });
};

// Export both functions so they can be used by other files
module.exports = { 
    sendPasswordResetEmail, 
    sendVerificationEmail 
};
const nodemailer = require('nodemailer');

const sendOtpEmail = async (email, otp) => {
    // Configured for using Ethereal for testing or placeholders for actual SMTP
    // In production, these should come from .env
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        auth: {
            user: process.env.EMAIL_USER || 'placeholder@example.com',
            pass: process.env.EMAIL_PASS || 'password'
        }
    });

    const mailOptions = {
        from: '"SafeVoice" <no-reply@safevoice.org>',
        to: email,
        subject: 'SafeVoice Registration OTP',
        text: `Your OTP for SafeVoice registration is: ${otp}. It will expire in 10 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP');
    }
};

module.exports = { sendOtpEmail };

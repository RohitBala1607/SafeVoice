const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isEmailAllowed } = require('../config/allowedDomains');
const { sendOtpEmail } = require('../utils/emailService');

exports.register = async (req, res) => {
    const { name, email, password, institution } = req.body;
    try {
        // 1. Validate Email Domain
        if (!isEmailAllowed(email, institution)) {
            return res.status(403).json({ message: 'Email domain not authorized for this institution' });
        }

        // 2. Check if User already exists
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'User already exists' });

        // 3. Generate static OTP for development/testing
        const otp = "123456";

        // 4. Hash password for pending user
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Save/Update OTP & Pending User Data in DB
        await Otp.findOneAndUpdate(
            { email },
            {
                otp,
                name,
                password_hash: hashedPassword,
                institution,
                createdAt: new Date()
            },
            { upsert: true, new: true }
        );

        // 6. Send OTP via Email
        await sendOtpEmail(email, otp);

        res.status(200).json({ message: 'OTP sent to your email. Please verify to complete registration.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        // 1. Check OTP
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // 2. OTP is valid, create user from stored data
        const newUser = new User({
            name: otpRecord.name,
            email: otpRecord.email,
            password_hash: otpRecord.password_hash,
            institution: otpRecord.institution
        });

        await newUser.save();

        // 3. Delete OTP record
        await Otp.deleteOne({ _id: otpRecord._id });

        // 4. Generate Token (Optional, but good for immediate login)
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            message: 'User created successfully',
            userId: newUser._id,
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email, institution: newUser.institution }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, institution: user.institution } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

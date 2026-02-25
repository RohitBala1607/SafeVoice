console.log("!!! SERVER IS STARTING FROM SAFE-VOICE-MAIN (1) !!!");
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/institutions', require('./routes/institutionRoutes'));
app.use('/api/authorities', require('./routes/authorityRoutes'));
app.use('/api/sos', require('./routes/sosRoutes'));

// 🛡️ Error Handling Middleware (Catches PayloadTooLargeError)
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'File too large. Please upload smaller evidence or compress files.' });
    }
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server' });
});


// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'SafeVoice API Server is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

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
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/institutions', require('./routes/institutionRoutes'));


// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'SafeVoice API Server is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

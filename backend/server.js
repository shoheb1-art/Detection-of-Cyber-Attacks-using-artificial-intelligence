require('./config/serverConfig'); // This ensures serverStartTime is set on start
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.disable('etag');

app.use(cors());
app.use(express.json());

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');

// --- USE ROUTES ---
app.use('/api', authRoutes); // for public auth routes
app.use('/api', apiRoutes);  // for protected api routes

// --- START THE SERVER ---
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const authRoute = require('./routes/auth.route');
const uploadRoute = require('./routes/upload.route');
const routes = require('./routes/index');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());

app.get("/ping", (req, res) => res.send("PONGG"));
app.use('/auth', authRoute);
app.use('/api', routes);
app.use('/upload', uploadRoute);

// ✅ Serve frontend (for BrowserRouter)
const __dirnamePath = path.resolve(); // because __dirname may not be defined in ES modules
const frontendPath = path.join(__dirnamePath, 'client', 'dist'); // adjust if your build folder is elsewhere

app.use(express.static(frontendPath));

// ✅ Catch-all: send index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => console.log(`🛜  Server is running on PORT: ${PORT}`));

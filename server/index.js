const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoute = require('./routes/auth.route');
const userRoute = require('./routes/user.route');
const ensureAuthenticated = require('./middlewares/Auth');

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.get("/ping", (req, res) => {
    res.send("PONGG"); 
});

app.use(bodyParser.json());
app.use(cors());

app.use('/auth', authRoute);
app.use('/api', ensureAuthenticated, userRoute);

app.listen(PORT, () => console.log(`🛜  Server is running on PORT: ${PORT}`))

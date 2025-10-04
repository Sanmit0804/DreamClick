// server/src/index.ts
import express, { type Request, type Response } from "express";
import connectDB from "./config/db.js";
import routes from './routes/index.js';

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", routes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

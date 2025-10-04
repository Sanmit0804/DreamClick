// server/src/index.ts
import express, { type Request, type Response } from "express";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.route.js";

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/users", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello There it's Sanmit Suthar");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

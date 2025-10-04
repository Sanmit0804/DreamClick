import { Router, type Request, type Response } from "express";
import User, { type IUser } from '../models/user.js';

const router = Router();

// Get all users
router.get("/", async (req: Request, res: Response) => {
  const users = await User.find();
  res.json(users);
});

// Add a user
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const newUser: IUser = new User({ name, email });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

export default router;

import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import User from "../entities/User";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";

const createSub = async (req: Request, res: Response) => {
    const {name, title, description} = req.body;
};

const router = Router();

router.post("/", userMiddleware, authMiddleware, createSub);   // call handler

export default router;
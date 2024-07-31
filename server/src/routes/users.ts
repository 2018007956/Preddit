import { Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user";

const getUserData = async (req: Request, res: Response) => {

}

const router = Router();
router.get("/:username", userMiddleware, getUserData);

export default router;
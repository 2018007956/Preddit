import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import User from "../entities/User";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import { isEmpty } from "class-validator";
import { getRepository } from "typeorm";
import Sub from "../entities/Sub";

const createSub = async (req: Request, res: Response) => {
    const {name, title, description} = req.body;

    try {
        let errors: any = {};
        if(isEmpty(name)) errors.name = "이름은 비워둘 수 없습니다.";
        if(isEmpty(title)) errors.title = "제목은 비워둘 수 없습니다.";
        
        const sub = await getRepository(Sub)    // select data in db using QueryBuilder
            .createQueryBuilder("sub")
            .where("lower(sub.name) = :name", { name: name.toLowerCase() })
            .getOne()

        if(sub) errors.name = "서브가 이미 존재합니다.";

        if (Object.keys(errors).length > 0) {
            throw errors;
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "문제가 발생했습니다." });
    }

    try {
        const user: User = res.locals.user;

        // Sub Instance 생성
        const sub = new Sub();
        sub.name = name;
        sub.description = description;
        sub.title = title;
        sub.user = user;

        // 데이터베이스 저장
        await sub.save() 

        // 저장한 정보 프론트엔드로 전달
        return res.json(sub);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." });
    }
};

const router = Router();

router.post("/", userMiddleware, authMiddleware, createSub);   // call handler

export default router;
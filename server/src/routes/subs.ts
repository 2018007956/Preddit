import { NextFunction, Request, Response, Router } from "express";
import User from "../entities/User";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import { isEmpty } from "class-validator";
import Sub from "../entities/Sub";
import { AppDataSource } from "../data-source";
import Post from "../entities/Post";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { unlinkSync } from "fs";
import { makeId } from "../utils/helpers";

const getSub = async (req: Request, res: Response) => {
    const name = req.params.name;

    try {
        const sub = await Sub.findOneByOrFail({ name });
        
        // 포스트를 생성한 후에 해당 sub에 속하는 포스트 정보들을 넣어주기
        const posts = await Post.find({
            where: { subName: sub.name },
            order: { createdAt: "DESC" },
            relations: ["comments", "votes"]
        });

        sub.posts = posts;
        console.log("posts", posts)

        return res.json(sub);
    } catch (error) {
        return res.status(404).json({ error: "커뮤니티를 찾을 수 없습니다." });
    }
}

const createSub = async (req: Request, res: Response) => {
    const {name, title, description} = req.body;

    try {
        let errors: any = {};
        if(isEmpty(name)) errors.name = "이름은 비워둘 수 없습니다.";
        if(isEmpty(title)) errors.title = "제목은 비워둘 수 없습니다.";
        
        const sub = await AppDataSource.getRepository(Sub)    // select data in db using QueryBuilder
            .createQueryBuilder("sub")
            .where("lower(sub.name) = :name", { name: name.toLowerCase() })
            .getOne();

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

const topSubs = async (_: Request, res: Response) => {
    try {
        const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || s."imageUrn", 
                                        'https://www.gravatar.com/avatar?d=mp&f=y')`;
        const subs = await AppDataSource
            .createQueryBuilder()
            .select(`s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`)
            .from(Sub, "s")
            .leftJoin(Post, "p", `s.name = p."subName"`)
            .groupBy('s.title, s.name, "imageUrl"')
            .orderBy(`"postCount"`, "DESC")
            .limit(5)
            .execute();
        return res.json(subs); // 프론트로 전달
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
}

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = res.locals.user;

    try {
        const sub = await Sub.findOneOrFail({ where: { name: req.params.name } });

        if(sub.username !== user.username) {
            return res.status(403).json({ error: "이 커뮤니티를 소유하고 있지 않습니다." });
        }

        res.locals.sub = sub;

        return next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." });        
    }
}

const upload = multer({
    storage: multer.diskStorage({
        destination: "public/images",
        filename: (_, file, callback) => {
            const name = makeId(10);
            callback(null, name + path.extname(file.originalname)); // imagename + .png
        },
    }),
    fileFilter: (_, file: any, callback: FileFilterCallback) => {
        if(file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
            callback(null, true);
        } else {
            callback(new Error("이미지가 아닙니다."));
        }
    },
})

const uploadSubImage = async (req: Request, res: Response) => {
    const sub: Sub = res.locals.sub;
    try {
        const type = req.body.type;

        // 지정된 파일 유형이 아니면 업로드 된 파일 삭제
        if(type !== "image" && type !== "banner") {
            if(!req.file?.path) {
                return res.status(400).json({ error: "유효하지 않은 파일" });
            }

            unlinkSync(req.file.path);
            return res.status(400).json({ error: "잘못된 유형" });
        }

        let oldImageUrn: string = "";

        if(type === "image") {
            // 사용중인 Urn을 저장 (이전 파일을 아래서 삭제하기 위함)
            oldImageUrn = sub.imageUrn || "";
            // 새로운 파일 이름을 Urn으로 넣어줌
            sub.imageUrn = req.file?.filename || "";
        } else if(type === "banner") {
            oldImageUrn = sub.bannerUrn || "";
            sub.bannerUrn = req.file?.filename || "";
        }
        await sub.save();

        // 사용하지 않는 이미지 파일 삭제
        if(oldImageUrn !== "") {
            // 데이터베이스는 파일 이름일 뿐이므로 개체 경로 접두사를 직접 추가해야 함
            const fullFileName = path.resolve(process.cwd(), "public", "images", oldImageUrn);

            unlinkSync(fullFileName);
        }

        return res.json(sub);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." });
    }
}

const router = Router();

router.get("/:name", userMiddleware, getSub);
router.post("/", userMiddleware, authMiddleware, createSub);   // call handler
router.get("/sub/topSubs", topSubs);
router.post("/:name/upload", userMiddleware, authMiddleware, ownSub, upload.single("file"), uploadSubImage);
export default router;
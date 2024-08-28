import { Request, Response, Router } from "express";
import userMiddleware from '../middlewares/user';
import authMiddleware from '../middlewares/auth';
import Sub from "../entities/Sub";
import Post from "../entities/Post";
import Comment from "../entities/Comment";
import Vote from "../entities/Vote";

const getPosts = async (req: Request, res: Response) => {
    const currentPage: number = (req.query.page || 0) as number;
    const perPage: number = (req.query.count || 8) as number;

    try {
        const posts = await Post.find({
            order: { createdAt: "DESC" },
            relations: ["sub", "votes", "comments"],
            skip: currentPage * perPage,
            take: perPage
        });

        if (res.locals.user) {
            posts.forEach((p) => p.setUserVote(res.locals.user));
        }

        return res.json(posts);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." });
    }
}

const getPost = async (req: Request, res: Response) => {
    const { identifier, slug } = req.params;
    try {
        const post = await Post.findOneOrFail({
            where: { identifier, slug },
            relations: ["sub", "votes"]
        })

        if (res.locals.user) {
            post.setUserVote(res.locals.user);
        }

        return res.send(post);
    } catch (error) {
        console.log(error);
        return res.status(404).json({ error: "게시물을 찾을 수 없습니다" });
    }
}

const createPost = async (req: Request, res: Response) => {
    const { title, body, sub } = req.body;
    if (title.trim() === "") {
        return res.status(400).json({ title: "제목은 비워둘 수 없습니다." });
    }

    const user = res.locals.user;

    try {
        const subRecord = await Sub.findOneByOrFail({ name: sub });
        const post = new Post();
        post.title = title;
        post.body = body;
        post.user = user;
        post.sub = subRecord;
        
        await post.save();
        
        return res.json(post);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." });
    }
}

const getPostComment = async (req: Request, res: Response) => {
    const { identifier, slug } = req.params;
    try {
        const post = await Post.findOneByOrFail({ identifier, slug });
        const comments = await Comment.find({
            where: { postId: post.id },
            order: { createdAt: "DESC" },
            relations: ["votes"]
        });

        if (res.locals.user) {
            comments.forEach((c) => c.setUserVote(res.locals.user))
        }

        return res.json(comments);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." });
    }
}

const createPostComment = async (req: Request, res: Response) => {
    const { identifier, slug } = req.params;
    const body = req.body.body;
    try {
        const post = await Post.findOneByOrFail({ identifier, slug });
        const comment = new Comment();
        comment.body = body;
        comment.user = res.locals.user;
        comment.post = post;

        if (res.locals.user) {
            post.setUserVote(res.locals.user);
        }

        await comment.save();
        return res.json(comment);
    } catch (error) {
        console.log(error);
        return res.status(404).json({ error: "게시물을 찾을 수 없습니다" });
    }
}

const deletePost = async (req: Request, res: Response) => {
    const { identifier, slug } = req.params;
    try {
        const post = await Post.findOneByOrFail({ identifier, slug });

        // 관련 투표 삭제
        const votes = await Vote.find({ where: { postId: post.id } });
        await Promise.all(votes.map(async (vote) => {
            await vote.remove();
        }));

        // 관련 댓글 삭제
        const comments = await Comment.find({ where: { postId: post.id } });
        await Promise.all(comments.map(async (comment) => {
            await comment.remove();
        }));

        // 포스트 삭제
        await post.remove();

        return res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
}

const deleteComment = async (req: Request, res: Response) => {
    const {  postIdentifier, slug, commentIdentifier } = req.params;
    const user = res.locals.user;

    try {
        const post = await Post.findOneOrFail({ where: { identifier: postIdentifier, slug } });
        const comment = await Comment.findOneOrFail({
            where: { identifier: commentIdentifier, postId: post.id },
            relations: ["user", "post"]
        });

        // 댓글 작성자나 포스트 작성자만 삭제 가능
        if (comment.user.username !== user.username && comment.post.username !== user.username) {
            return res.status(403).json({ error: "You don't have permission to perform this action." });
        }

        // 관련 투표 삭제
        await Vote.delete({ commentId: comment.id });

        // 댓글 삭제
        await comment.remove();

        return res.json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
}

const router = Router();
router.get("/:identifier/:slug", userMiddleware, getPost)
router.post("/", userMiddleware, authMiddleware, createPost);
router.delete("/:identifier/:slug", userMiddleware, authMiddleware, deletePost);
router.get("/", userMiddleware, getPosts)
router.get("/:identifier/:slug/comments", userMiddleware, getPostComment);
router.post("/:identifier/:slug/comments", userMiddleware, createPostComment);
router.delete("/:postIdentifier/:slug/comments/:commentIdentifier", userMiddleware, authMiddleware, deleteComment);
export default router;
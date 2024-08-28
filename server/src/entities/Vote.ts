import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import BaseEntity from './Entity';
import User from "./User";
import Post from "./Post";
import Comment from "./Comment";

@Entity("votes")
export default class Vote extends BaseEntity {
    @Column()
    value: number;

    @ManyToOne(() => User)
    @JoinColumn({name: "username", referencedColumnName: "username"})
    user: User;

    @Column()
    username: string;

    @Column({nullable: true})
    postId: number;

    @ManyToOne(() => Post)
    post: Post;

    @Column({nullable: true})
    commentId: number;

    @ManyToOne(() => Comment, (comment) => comment.votes, {
        // comment를 삭제할 때 연관된 vote도 자동으로 삭제되도록 외래 키 제약 조건을 ON DELETE CASCADE로 설정
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "commentId" })
    comment: Comment;
}
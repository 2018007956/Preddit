import PostCard from '@/src/components/PostCard';
import { Comment, Post } from '@/src/types';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router'
import React from 'react'
import useSWR from 'swr';
import axios from 'axios';
const UserPage = () => {
    const router = useRouter();
    const username = router.query.username;

    const { data, error, mutate } = useSWR<any>(username ? `/users/${username}` : null);

    const handlePostDelete = async (identifier: string, slug: string) => {
        try {
            await axios.delete(`/posts/${identifier}/${slug}`);
            mutate();
        } catch (error) {
            console.log(error);
        }
    }

    if (!data) return null;
    return (
        <div className="flex max-w-5xl px-4 pt-5 mx-auto">
            {/* 유저 포스트 댓글 리스트 */}
            <div className='w-full md:mr-3 md:w-8/12'>
                {data.userData.map((data: any) => {
                    if (data.type === "Post") {
                        const post: Post = data;
                        return <PostCard key={post.identifier} post={post} onDelete={handlePostDelete} />
                    } else {
                        const comment: Comment = data;
                        return (
                            <div
                                key={comment.identifier}
                                className="flex my-4 bg-gray-100 rounded border"
                            >
                                <div className='flex-shrink-0 w-10 py-10 text-center bg-white border-r rounded-l'>
                                    <i className="text-gray-500 fas fa-comment-alt fa-xs"></i>
                                </div>
                                <div className='w-full p-2'>
                                    <p className='mb-2 text-xs text-gray-500'>
                                        <Link href={`/u/${comment.username}`}>
                                            <span className='cursor-pointer hover:underline'>
                                                {comment.username}
                                            </span>
                                        </Link>{" "}
                                        <span>commented on</span>{" "}
                                        <Link href={`/u/${comment.post?.url}`}>
                                            <span className='font-semibold cursor-pointer hover:underline'>
                                                {comment.post?.title}
                                            </span>
                                        </Link>{" "}
                                        <span>•</span>{" "}
                                        <Link href={`/u/${comment.post?.subName}`}>
                                            <span className='text-black cursor-pointer hover:underline'>
                                                /r/{comment.post?.subName}
                                            </span>
                                        </Link>
                                    </p>
                                    <hr />
                                    <p className="p-1">{comment.body}</p>
                                </div>
                            </div>
                        )
                    }
                })}
            </div>
            {/* 유저 정보 */}
            <div className='hidden w-4/12 ml-3 md:block'>
                <div className='flex items-center p-3 rounded-t bg-gray-300 mt-4'>
                    <div className='flex items-center'>
                        <Image
                            src="https://www.gravatar.com/avatar/0000?d=mp&f=y"
                            alt="user profile"
                            className="mx-auto border border-white rounded-full"
                            width={40}
                            height={40}
                        />
                        <p className="font-bold pl-2 text-md">{data.user.username}</p>
                    </div>
                </div>
                <div className="p-2 px-3 bg-white rounded-b">
                    <p>
                        Joined on {dayjs(data.user.createdAt).format("D MMM YYYY")}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default UserPage
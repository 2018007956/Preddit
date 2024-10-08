import { Post } from '@/src/types';
import axios from 'axios'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router';
import React, { FormEvent, useState } from 'react'

const PostCreate = () => {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const router = useRouter();
    const { sub: subName } = router.query;

    const submitPost = async (e: FormEvent) => {
        e.preventDefault();

        if (title.trim() === "" || !subName) return;

        try {
            const { data: post } = await axios.post<Post>("/posts", {
                title: title.trim(),
                body,
                sub: subName
            });

            router.push(`/r/${subName}/${post.identifier}/${post.slug}`);
        } catch (error) {
            console.log(error);
        }
    }
    
    return (
        <div className='flex flex-col pl-60 pt-20'>
            <div className='md:w-96 md:w-[35rem] p-4 bg-white rounded border border-gray-300'>
                <h1 className='font-bold mb-3 text-lg'>Create post</h1>
                <form onSubmit={submitPost}>
                    <div className='relative mb-2'>
                        <input
                            type="text"
                            className="w-full px-3 py-2 text-black text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="Title"
                            maxLength={20}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <div
                            style={{ top: 10, right: 10 }}
                            className="absolute mb-2 text-sm text-gray-400 select-none"
                        >
                            {title.trim().length}/20
                        </div>
                    </div>
                    <textarea
                        rows={10}
                        placeholder="Body"
                        className='w-full p-3 text-black text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500'
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />
                    <div className='flex justify-end'>
                        <button
                            className='px-4 py-1 text-sm font-semibold text-white bg-gray-400 border rounded-full'
                            disabled={title.trim().length === 0}
                        >
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PostCreate

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    try {
        const cookie = req.headers.cookie;
        if (!cookie) throw new Error("쿠키가 없습니다.");

        await axios.get(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/api/auth/me`, { headers: { cookie } });

        return { props: {} };
    } catch (error) {
        res.writeHead(307, { Location: "/login" }).end();
        return { props: {} };
    }
}
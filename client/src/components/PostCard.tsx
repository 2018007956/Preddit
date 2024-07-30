import React from 'react'
import { Post } from '../types'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa6'
import Link from 'next/link'
import Image from 'next/image'
import dayjs from 'dayjs'
import { useAuthState } from '../context/auth'
import axios from 'axios'
import { useRouter } from 'next/router'

interface PostCardProps {
    post: Post
    subMutate: () => void
}

const PostCard = ({ 
    post: {
        identifier, 
        slug, 
        title, 
        body, 
        subName, 
        createdAt, 
        voteScore, 
        userVote, 
        commentCount, 
        url, 
        username, 
        sub
    },
    subMutate
 }: PostCardProps) => {
    const { authenticated } = useAuthState()
    const router = useRouter()
    const vote = async (value: number) => {
        if (!authenticated) router.push('/login');
        
        if (value === userVote) value = 0;   // 선택 해제

        try {
            await axios.post('/votes', { identifier, slug, value });
            subMutate();
        } catch (error) {
            console.log(error);
        }        
    }
    return (
        <div
            className='flex mb-4 bg-white rounded'
            id={identifier}
        >
            {/* Vote */}
            <div className="flex-shrink-0 w-10 py-2 text-center rounded-l">
                {/* 좋아요 */}
                <div
                    className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                    onClick={() => vote(1)}
                >
                    {userVote === 1 ?
                        <FaArrowUp className="text-red-500" />
                        : <FaArrowUp />
                    }
                </div>
                <p className="text-xs font-bold">{voteScore}</p>
                {/* 싫어요 */}
                <div
                    className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-500"
                    onClick={() => vote(-1)}
                >
                    {userVote === -1 ?
                        <FaArrowDown className="text-blue-500" />
                        : <FaArrowDown />
                    }
                </div>
            </div>
            {/* 포스트 데이터 부분 */}
            <div className="w-full p-2">
                {/* <div className='flex items-center'>
                    <Link href={`/r/${subName}`}>
                        <Image
                            src={sub!.imageUrl}
                            alt="sub"
                            className='rounded-full cursor-pointer'
                            width={12}
                            height={12}
                        />
                    </Link>
                    <Link href={`/r/${subName}`}>
                        <a className="ml-2 text-xs font-bold cursor-pointer hover:underline">
                            /r/{subName}
                        </a>
                    </Link>
                    <span className="mx-1 text-xs text-gray-400">•</span>
                </div> */}

                <p className="text-xs text-gray-400">
                    Posted by
                    <Link href={`/u/${username}`}>
                        <span className="mx-1 hover:underline">/u/{username}</span>
                    </Link>
                    <Link href={url}>
                        <span className='mx-1 hover:underline'>
                            {dayjs(createdAt).format('YYYY-MM-DD HH:mm')}
                        </span>
                    </Link>
                </p>
                
                <Link href={url}>
                    <span className="my-1 text-lg font-medium">{title}</span>
                </Link>
                {body && <p className="my-1 text-sm">{body}</p>}
                <div className="flex">
                    <Link href={url}>
                        <i className="mr-1 fas fa-comment-alt fa-xs"></i>
                        <span>{commentCount}</span>
                    </Link>

                </div>
            </div>
        </div>
    )
}

export default PostCard
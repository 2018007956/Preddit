import React, { useState, useRef, useEffect } from 'react'
import { Post } from '../types'
import { FaArrowDown, FaArrowUp, FaEllipsisV } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'
import dayjs from 'dayjs'
import { useAuthState } from '../context/auth'
import axios from 'axios'
import { useRouter } from 'next/router'
import Login from '../pages/login'
import Register from '../pages/register'

interface PostCardProps {
    post: Post
    subMutate?: () => void
    mutate?: () => void
    onDelete: (identifier: string, slug: string) => void
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
    mutate,
    subMutate,
    onDelete
 }: PostCardProps) => {
    const { authenticated } = useAuthState()
    const router = useRouter()
    const isInSubPage = router.pathname === '/r/[sub]'
    const [showOptions, setShowOptions] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editedTitle, setEditedTitle] = useState(title)
    const [editedBody, setEditedBody] = useState(body) 
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false); 
    const optionsRef = useRef<HTMLDivElement>(null);

    // 외부 클릭을 감지하는 이벤트 리스터 설정
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
                setShowOptions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const openLoginModal = () => {
        setIsLoginModalOpen(true);
        setIsRegisterModalOpen(false);
      };
    
      const openRegisterModal = () => {
        setIsRegisterModalOpen(true);
        setIsLoginModalOpen(false);
      };
    
      const closeLoginModal = () => setIsLoginModalOpen(false);
      const closeRegisterModal = () => setIsRegisterModalOpen(false);

    const vote = async (value: number) => {
        if (!authenticated) {
            openLoginModal();
            return;
        }

        if (value === userVote) value = 0;   // 선택 해제

        try {
            await axios.post('/votes', { identifier, slug, value });
            if (mutate) mutate();
            if (subMutate) subMutate();
        } catch (error) {
            console.log(error);
        }        
    }

    const handleEditClick = () => {
        setIsEditing(true)
        setShowOptions(false)
    }

    const handleEditSubmit = async () => {
        try {
            await axios.put(`/posts/${identifier}/${slug}`, { title: editedTitle, body: editedBody })
            setIsEditing(false)
            if (mutate) mutate()
            if (subMutate) subMutate()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div
            className='flex mb-4 bg-white rounded border border-gray-300'
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
                        : <FaArrowUp className={voteScore && voteScore > 0 ? "text-red-500" : ""} />
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
                        : <FaArrowDown className={voteScore && voteScore < 0 ? "text-blue-500" : ""} />
                    }
                </div>
            </div>
            {/* 포스트 데이터 부분 */}
            <div className="w-full p-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {!isInSubPage && (
                            <div className='flex items-center'>
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
                                    <span className="ml-2 text-xs font-bold cursor-pointer hover:underline">
                                        /r/{subName}
                                    </span>
                                </Link>
                                <span className="mx-1 text-xs text-gray-400">•</span>
                            </div>
                        )}

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
                    </div>

                    {authenticated && (
                        <div className="relative" ref={optionsRef}>
                            <button
                                className="px-1 py-1 text-xs text-gray-400 rounded"
                                onClick={() => setShowOptions(!showOptions)}
                            >
                                <FaEllipsisV />
                            </button>
                            {showOptions && (
                                <div className="absolute right-0 top-full mb-1 w-32 py-2 bg-white rounded-lg shadow-xl">
                                    <button
                                        className="textColorCompat block w-full px-4 py-2 text-xs text-left hover:bg-gray-100"
                                        onClick={handleEditClick}
                                    >
                                        수정
                                    </button>
                                    <button
                                        className="textColorCompat block w-full px-4 py-2 text-xs text-left hover:bg-gray-100"
                                        onClick={() => {
                                            onDelete(identifier, slug);
                                            setShowOptions(false);
                                        }}
                                    >
                                        삭제
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="mt-2 mr-8">
                        <input
                            type="text"
                            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                        />
                        <textarea
                            className="w-full px-3 py-2 mt-2 text-black border border-gray-300 rounded-md"
                            value={editedBody}
                            onChange={(e) => setEditedBody(e.target.value)}
                        />
                        <div className="mt-1 flex justify-end">
                            <button
                                className="px-3 py-1 mr-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                onClick={handleEditSubmit}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
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
                    </>
                )}

            </div>
            <>
                <Login 
                  isOpen={isLoginModalOpen}
                  onClose={closeLoginModal}
                  openRegisterModal={openRegisterModal}
                />
                <Register
                  isOpen={isRegisterModalOpen}
                  onClose={closeRegisterModal}
                  openLoginModal={openLoginModal}
                />
            </>
        </div>
    )
}

export default PostCard
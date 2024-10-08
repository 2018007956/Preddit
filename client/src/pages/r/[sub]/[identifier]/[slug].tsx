import { useAuthState } from '@/src/context/auth';
import { Comment, Post } from '@/src/types';
import axios from 'axios';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FormEvent, useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import { FaArrowDown, FaArrowUp, FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa";
import Login from '@/src/pages/login';
import Register from '@/src/pages/register';

const PostPage = () => {
    const router = useRouter();
    const { sub, identifier, slug } = router.query;
    const { authenticated, user } = useAuthState();
    const [newComment, setNewComment] = useState("");
    const { data: post, error, mutate: postMutate } = useSWR<Post>(
        identifier && slug ? `/posts/${identifier}/${slug}` : null
    )
    const { data: comments, mutate: commentMutate } = useSWR<Comment[]>(
        identifier && slug ? `/posts/${identifier}/${slug}/comments` : null
    )
    const [showOptions, setShowOptions] = useState<Record<string, boolean>>({})
    const [isEditing, setIsEditing] = useState(false)
    const [editedTitle, setEditedTitle] = useState("")
    const [editedBody, setEditedBody] = useState("")
    
    const [aiResponse, setAIResponse] = useState("");
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);  

    const optionsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
                setShowOptions({})
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    useEffect(() => {
        if (post) {
            setEditedTitle(post.title)
            setEditedBody(post.body)
        }
    }, [post])

    const toggleOptions = (identifier: string) => {
        setShowOptions(prev => ({
            ...prev,
            [identifier]: !prev[identifier]
        }));
    };
    
    const generateAIResponse = async () => {
        if (!post?.body) return;
        setIsGeneratingAI(true);
        try {
            const response = await axios.post(`/generate-ai-response/${identifier}/${slug}`, { prompt: post.body });
            setAIResponse(response.data);
        } catch (error) {
            console.error('AI 응답 생성 중 오류 발생:', error);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const formatAIResponse = (text: string) => {
        return text.trimEnd().split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line.split(/(\*\*.*?\*\*)/).map((part, i) => 
              part.startsWith('**') && part.endsWith('**') ? 
                <strong key={i}>{part.slice(2, -2)}</strong> : part
            )}
            {index < text.length - 1 && <br />}
          </React.Fragment>
        ));
    };

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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (newComment.trim() === "") return;
        try {
            await axios.post(`/posts/${post?.identifier}/${post?.slug}/comments`, {
                body: newComment,
            });
            commentMutate();
            setNewComment("");
        } catch (error) {
            console.log(error);
        }
    }

    const handleEditClick = () => {
        setIsEditing(true)
        setShowOptions({})
    }

    const handleEditSubmit = async () => {
        try {
            const response = await axios.put(`/posts/${identifier}/${slug}`, { title: editedTitle, body: editedBody })
            setIsEditing(false)
            // slug가 변경되었다면 새로운 url로 페이지 리로드
            if (response.data.slug !== slug) {
                router.push(`/r/${sub}/${identifier}/${response.data.slug}`)
            } 
            // slug가 변경되지 않았다면 현재 페이지에서 데이터만 갱신
            else {
                if (postMutate) await postMutate()
                if (commentMutate) await commentMutate()
            }
        } catch (error) {
            console.log(error)
        }
    }

    const onDeleteComment = async (identifier: string) => {
        try {
            await axios.delete(`/posts/${post?.identifier}/${post?.slug}/comments/${identifier}`);
            commentMutate();
        } catch (error) {
            console.log(error);
        }
    }

    const vote = async (value: number, comment?: Comment) => {
        if (!authenticated) {
            openLoginModal();
            return;
        }

        // 이미 클릭한 vote 버튼을 눌렀을 시에는 reset
        if (
            (!comment && value === post?.userVote) || 
            (comment && value === comment.userVote)
        ) {
            value = 0;
        }

        try {
            await axios.post("/votes", {
                identifier, 
                slug, 
                commentIdentifier: comment?.identifier, 
                value,
            });
            postMutate();
            commentMutate();
        } catch (error) {
            console.log(error);
        }
    }

    const onDelete = async (identifier: string, slug: string) => {
        try {
            await axios.delete(`/posts/${identifier}/${slug}`);
            router.push('/');
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="flex max-w-5xl px-4 pt-5 mx-auto">
            {/* Post */}
            <div className="w-full md:mr-3 md:w-8/12">
                <div className="bg-white rounded border border-gray-300">
                    {post && (
                        <>
                            <div className="flex">
                                {/* 좋아요 싫어요 기능 부분 */}
                                <div className="flex-shrink-0 w-10 py-2 text-center rounded-l">
                                    {/* 좋아요 */}
                                    <div
                                        className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                                        onClick={() => vote(1)}
                                    >
                                        {post.userVote === 1 ? 
                                            <FaArrowUp className="text-red-500"/> : 
                                            <FaArrowUp className={post.voteScore && post.voteScore > 0 ? "text-red-500" : ""}/>}
                                    </div>
                                    <p className="text-xs font-bold">{post.voteScore}</p>
                                    {/* 싫어요 */}
                                    <div
                                        className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-500"
                                        onClick={() => vote(-1)}
                                    >
                                        {post.userVote === -1 ? 
                                            <FaArrowDown className="text-blue-500"/> : 
                                            <FaArrowDown className={post.voteScore && post.voteScore < 0 ? "text-blue-500" : ""}/>}
                                    </div>
                                </div>
                                <div className="py-2 pr-2 w-full">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-400">
                                            Posted by 
                                            <Link href={`/u/${post.username}`}>
                                                <span className="hover:underline">
                                                    /u/{post.username}
                                                </span>
                                            </Link>
                                            <Link href={post.url}>
                                                <span className="hover:underline">
                                                    {dayjs(post.createdAt).format("YYYY-MM-DD HH:mm")}
                                                </span>
                                            </Link>
                                        </p>
                                        {authenticated && (
                                            <div className="relative" ref={optionsRef}>
                                                <button
                                                    className="px-1 py-1 text-xs text-gray-400 rounded"
                                                    onClick={() => toggleOptions(post.identifier)}
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                {showOptions[post.identifier] && (
                                                    <div className="absolute right-0 top-full mb-1 w-32 py-2 bg-white rounded-lg shadow-xl">
                                                        <button
                                                                className="textColorCompat hover-bg-compat block w-full px-4 py-2 text-xs text-left flex items-center"
                                                                onClick={handleEditClick}
                                                            >
                                                            <FaEdit className="mr-2" /> Edit
                                                        </button>
                                                        <button
                                                            className="textColorCompat hover-bg-compat block w-full px-4 py-2 text-xs text-left flex items-center"
                                                            onClick={() => {
                                                                onDelete(post.identifier, post.slug);
                                                                setShowOptions({});
                                                            }}
                                                        >
                                                            <FaTrash className="mr-2" /> Delete
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
                                            <Link href={post.url}>
                                                <span className="my-1 text-lg font-medium">{post.title}</span>
                                            </Link>
                                            {post.body && <p className="my-1 text-sm">{post.body}</p>}
                                            <div className="mt-2 mb-4 flex justify-end">
                                                <button
                                                    className="px-3 py-1.5 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 mr-4"
                                                    onClick={generateAIResponse}
                                                    disabled={isGeneratingAI}
                                                >
                                                    {isGeneratingAI ? 'AI Replying...' : 'AI Reply'}
                                                </button>
                                            </div>
                                            {aiResponse && (
                                                <div className="mt-4 p-4 bg-compat rounded-md mr-8">
                                                    <p className="text-sm">{formatAIResponse(aiResponse)}</p>
                                                </div>
                                            )}
                                            <div className="flex">
                                                <Link href={post.url}>
                                                    <i className="mr-1 fas fa-comment-alt fa-xs"></i>
                                                    <span>{post.commentCount}</span>
                                                </Link>
                                            </div>
                                            {/* 댓글 작성 구간 */}
                                            <div className="pr-8 mb-2 pl-7">
                                                {authenticated ?
                                                    (<div>
                                                        <form onSubmit={handleSubmit}>
                                                            <textarea
                                                                placeholder="Add a comment"
                                                                className="w-full p-3 bg-comment-compat border border-gray-300 rounded focus:outline-none focus:border-gray-600"
                                                                onChange={e => setNewComment(e.target.value)}
                                                                value={newComment}
                                                            >
                                                            </textarea>
                                                            <div className="flex justify-end">
                                                                <button
                                                                    className="px-3 py-1 text-sm text-white bg-gray-400 rounded-full"
                                                                    disabled={newComment.trim() === ""}
                                                                >
                                                                    Comment
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </div>)
                                                    :
                                                    (<div className="flex items-center justify-between px-2 py-4 border border-gray-200 rounded">
                                                        <p className="font-semibold text-gray-400">
                                                            Please sign in to write comments.
                                                        </p>
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
                                                    </div>)
                                                }
                                            </div>
                                            {/* 댓글 리스트 부분 */}
                                            {Array.isArray(comments) && comments?.map(comment => (
                                                <div className="flex" key={comment.identifier}>
                                                    {/* 좋아요 싫어요 기능 부분 */}
                                                    <div className="flex-shrink-0 w-10 py-2 text-center rounded-l">
                                                        {/* 좋아요 */}
                                                        <div
                                                            className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                                                            onClick={() => vote(1, comment)}
                                                        >
                                                            {comment.userVote === 1 ? 
                                                                <FaArrowUp className="text-red-500"/> : 
                                                                <FaArrowUp className={comment.voteScore > 0 ? "text-red-500" : ""}/>}
                                                        </div>
                                                        <p className="text-xs font-bold">{comment.voteScore}</p>
                                                        {/* 싫어요 */}
                                                        <div
                                                            className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-500"
                                                            onClick={() => vote(-1, comment)}
                                                        >
                                                            {comment.userVote === -1 ? 
                                                                <FaArrowDown className="text-blue-500"/> : 
                                                                <FaArrowDown className={comment.voteScore < 0 ? "text-blue-500" : ""}/>}
                                                        </div>
                                                    </div>
                                                    <div className="py-2 pr-2 w-full">
                                                        <div className="flex items-center justify-between">
                                                            <p className="mb-1 text-xs leading-none">
                                                                <Link href={`/u/${comment.username}`}>
                                                                    <span className="mr-1 font-bold hover:underline">
                                                                        {comment.username}
                                                                    </span>
                                                                </Link>
                                                                <span className="text-gray-600">
                                                                    {`
                                                                        ${comment.voteScore}
                                                                        posts
                                                                        ${dayjs(comment.createdAt).format("YYYY-MM-DD HH:mm")}
                                                                    `}
                                                                </span>
                                                            </p>
                                                            {/* 댓글 삭제 */}
                                                            {authenticated && (
                                                                <div className="relative" ref={optionsRef}>
                                                                    <button
                                                                        className="px-1 py-1 text-xs text-gray-400 rounded"
                                                                        onClick={() => toggleOptions(comment.identifier)}
                                                                    >
                                                                        <FaEllipsisV />
                                                                    </button>
                                                                    {showOptions[comment.identifier] && (
                                                                        <div className="absolute right-0 top-full mb-1 w-32 py-2 bg-white rounded-lg shadow-xl">
                                                                            <button
                                                                                className="textColorCompat hover-bg-compat block w-full px-4 py-2 text-xs text-left flex items-center"
                                                                                onClick={() => {
                                                                                    onDeleteComment(comment.identifier);
                                                                                    setShowOptions({});
                                                                                }}
                                                                            >
                                                                                <FaTrash className="mr-2" /> Delete
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-sm mr-6">{comment.body}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PostPage
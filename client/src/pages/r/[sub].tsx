import PostCard from '@/src/components/PostCard';
import Sidebar from '@/src/components/Sidebar';
import { useAuthState } from '@/src/context/auth';
import { Post } from '@/src/types';
import axios from 'axios'
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import useSWR from 'swr';

const SubPage = () => {
    const [ownSub, setOwnSub] = useState(false);
    const { authenticated, user } = useAuthState();
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const subName = router.query.sub;
    const { data: sub, error, mutate } = useSWR(subName ? `/subs/${subName}` : null);
    const handlePostDelete = async (identifier: string, slug: string) => {
        try {
          await axios.delete(`/posts/${identifier}/${slug}`);
          mutate();
        } catch (error) {
          console.log(error);
        }
    }

    useEffect(() => {
        if(!sub) return;
        setOwnSub(authenticated && user!.username === sub.username);
    }, [])

    const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
        if(event.target.files === null) return;
        const file = event.target.files[0];

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", fileInputRef.current!.name);

        try { // Request to Backend
            await axios.post(`/subs/${sub.name}/upload`, formData, {
                headers: { "Context-Type": "multipart/form-data" },
            });
        } catch (error) {
            console.log(error);
        }
    }

    const openFileInput = (type: string) => {
        if(!ownSub) return; // 자신이 만든 커뮤니티만 사진 변경 가능
        const fileInput = fileInputRef.current;
        if(fileInput) {
           fileInput.name = type;
           fileInput.click(); 
        }
    }

    let renderPosts;
    if(!sub) {
        renderPosts = <p className="text-lg text-center">Loading...</p>;
    } else if (sub.posts.length === 0) {
        renderPosts = <p className='text-lg text-center'>No posts have been created yet.</p>;
    } else {
        renderPosts = sub.posts.map((post: Post) => (
            <PostCard key={post.identifier} post={post} subMutate={mutate} onDelete={handlePostDelete} />
        ));
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <h1 className="mb-4 text-3xl font-bold text-gray-800">Community not found</h1>
                <p className="mb-4 text-xl text-gray-600 text-center">
                    There aren't any communities with that name.<br />
                    Check the name or try searching for similar communities.
                </p>
                <button 
                    onClick={() => router.push('/')} 
                    className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                    Browse Other Communities
                </button>
            </div>
        );
    }

    return (
        <>
            {sub &&
                <>
                    <div>
                        <input type="file" hidden={true} ref={fileInputRef} onChange={uploadImage}/>
                        {/* 배너 이미지 */}
                        <div className="bg-gray-400">
                            {sub.bannerUrl ? (
                                <div
                                    className='h-56'
                                    style={{
                                        backgroundImage: `url(${sub.bannerUrl})`,
                                        backgroundRepeat: "no-repeat",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                    onClick={() => openFileInput("banner")}
                                ></div>
                            ) : (
                                <div 
                                    className="h-20 bg-gray-400"
                                    onClick={() => openFileInput("banner")}
                                ></div>
                            )}
                        </div>
                        {/* Sub meta data */}
                        <div className='h-20 bg-white'>
                            <div className='relative flex max-w-5xl px-5 mx-auto'>
                                <div className='absolute' style={{ top: -15 }}>
                                    {sub.imageUrl && (
                                        <Image
                                            src={sub.imageUrl}
                                            alt="커뮤니티 이미지"
                                            width={70}
                                            height={70}
                                            className="rounded-full"
                                            onClick={() => openFileInput("image")}
                                        />
                                    )}
                                </div>
                                <div className='pt-2 pl-24'>
                                    <h1 className='text-3xl font-bold'>{sub.name}</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Posts & Sidebar */}
                    <div className='flex max-w-5xl px-4 pt-5 mx-auto'>
                        <div className='w-full md:mr-3 md:w-8/12'>{renderPosts}</div>
                        <Sidebar sub={sub} />
                    </div>
                </>
            }
        </>
    )
}

export default SubPage
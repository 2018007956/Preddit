import React, { useState } from 'react'
import { useAuthState } from '../context/auth'
import { Sub } from '../types'
import Link from 'next/link'
import dayjs from 'dayjs'
import axios from 'axios'
import { useRouter } from 'next/router'
import { mutate } from 'swr'

type Props = {
    sub: Sub
}

const Sidebar = ({ sub }: Props) => {
    const { authenticated, user } = useAuthState();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editedDescription, setEditedDescription] = useState(sub?.description);

    const deleteSub = async () => {
        if (confirm("Are you sure you want to delete this?")) {
            try {
                await axios.delete(`/subs/${sub.name}`);
                mutate("/subs/sub/topSubs");
                router.push("/");
            } catch (error) {
                console.log(error);
            }
        }
    };

    const handleEdit = async () => {
        try {
            const { data } = await axios.put(`/subs/${sub.name}`, { 
                description: editedDescription 
            });
            
            mutate(`/subs/${sub.name}`, { ...sub, description: data.description }, false);
            
            setIsEditing(false);
        } catch (error) {
            console.log(error);
        }
    };

    return (
    <div className='sidebar hidden w-4/12 ml-3 md:block'>
            <div className='bg-gray-100 border rounded'>
                <div className='p-3'>
                    <div className='flex items-center mb-1'>
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
                                    className="flex-grow p-1 text-base border rounded"
                                />
                                <button onClick={handleEdit} className="ml-2 text-green-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <button onClick={() => setIsEditing(false)} className="ml-2 text-red-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <>
                                <p className='flex-grow text-base'>{sub?.description}</p>
                                {user && user.username === sub.username && (
                                    <button onClick={() => setIsEditing(true)} className="ml-2 text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    <div className='flex mb-3 text-sm font-medium'>
                        <div className='w-1/2'>
                            <p>100</p>
                            <p>Members</p>
                        </div>
                    </div>

                    <p className='text-sm my-3'>
                        {dayjs(sub?.createdAt).format("D MMM YYYY")}
                    </p>


                    <p className="text-sm text-gray-600">
                        Created by: {' '}
                        <Link href={`/u/${sub?.username}`} className="font-medium hover:underline">
                            {sub?.username}
                        </Link>
                    </p>

                    {authenticated && (
                        <>
                            <hr className="border-gray-300 my-3" />
                            <div className='mx-0 my-2'>
                                <div className="flex justify-between gap-2">
                                    <Link href={`/r/${sub.name}/create`} className="flex-1">
                                        <span className="block p-2 text-sm text-white bg-gray-400 rounded-full text-center">
                                            Create Post
                                        </span>
                                    </Link>
                                    {user && user.username === sub.username && (
                                        <button
                                            className="flex-1 p-2 text-sm text-white bg-red-500 rounded-full"
                                            onClick={deleteSub}
                                        >
                                            Delete a community
                                        </button>
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

export default Sidebar
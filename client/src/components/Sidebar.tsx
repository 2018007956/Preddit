import React from 'react'
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

    return (
    <div className='sidebar hidden w-4/12 ml-3 md:block'>
            <div className='bg-gray-100 border rounded'>
                <div className='p-3'>
                    <p className='mb-1 text-base'>{sub?.description}</p>
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
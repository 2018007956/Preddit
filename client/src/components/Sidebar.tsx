import React from 'react'
import { useAuthState } from '../context/auth'
import { Sub } from '../types'
import Link from 'next/link'
import dayjs from 'dayjs'
import axios from 'axios'
import { useRouter } from 'next/router'
type Props = {
    sub: Sub
}

const Sidebar = ({ sub }: Props) => {
    const { authenticated } = useAuthState();
    const router = useRouter();

    const deleteSub = async () => {
        if (confirm("정말로 이 커뮤니티를 삭제하시겠습니까?")) {
            try {
                await axios.delete(`/subs/${sub.name}`);
                router.push("/");
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
    <div className='hidden w-4/12 ml-3 md:block'>
            <div className='bg-white border rounded'>
                <div className='p-3 bg-gray-400 rounded-t'>
                    <p className='font-semibold text-white'>커뮤니티에 대해서</p>
                </div>
                <div className='p-3'>
                    <p className='mb-3 text-base'>{sub?.description}</p>
                    <div className='flex mb-3 text-sm font-medium'>
                        <div className='w-1/2'>
                            <p>100</p>
                            <p>멤버</p>
                        </div>
                    </div>
                    <p className='my-3'>
                        {dayjs(sub?.createdAt).format("D MMM YYYY")}
                    </p>

                    {authenticated && (
                        <div className='mx-0 my-2'>
                            <div className="flex justify-between gap-2">
                                <Link href={`/r/${sub.name}/create`} className="flex-1">
                                    <span className="block p-2 text-sm text-white bg-gray-400 rounded text-center">
                                        포스트 생성
                                    </span>
                                </Link>
                                <button
                                    className="flex-1 p-2 text-sm text-white bg-red-500 rounded"
                                    onClick={deleteSub}
                                >
                                    커뮤니티 삭제
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Sidebar
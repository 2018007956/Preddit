import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { Sub } from "../types";
import { useAuthState } from "../context/auth";

export default function MainSidebar() {
  const { authenticated } = useAuthState();
  const { data: topSubs } = useSWR<Sub[]>("/subs/sub/topSubs");

  return (
    <div className='w-64 fixed left-0 top-0 h-screen bg-white border-r pt-10'>
      <div className='p-4'>

        {authenticated && (
          <Link href="/subs/create" className='block'>
            <span className='px-2 flex items-center text-sm font-medium text-blue-500 hover:bg-gray-200 rounded p-2'>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create a community
            </span>
          </Link>
        )}

        <div className='overflow-y-auto h-[calc(100vh-14rem)]'>
          {topSubs?.map((sub) => (
            <div
              key={sub.name}
              className="flex items-center px-2 py-2 hover:bg-gray-200"
            >
              <Link href={`/r/${sub.name}`} className="flex items-center flex-grow">
                <Image
                  src={sub.imageUrl}
                  className="rounded-full"
                  alt="Sub"
                  width={24}
                  height={24}
                />
                <span className='ml-2 text-sm font-medium'>
                  r/{sub.name}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
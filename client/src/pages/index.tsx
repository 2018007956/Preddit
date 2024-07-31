import Link from "next/link"
import useSWR from "swr";
import { Post, Sub } from "../types";
import axios from "axios";
import Image from "next/image";
import { useAuthState } from "../context/auth";
import useSWRInfinite from "swr/infinite";
import PostCard from "../components/PostCard";

export default function Home() {
  const { authenticated } = useAuthState();
  const fetcher = async (url: string) =>
    await axios.get(url).then(res => res.data);
  const address = "http://localhost:4000/api/subs/sub/topSubs";

  const getKey = (pageIndex: number, previousPageData: Post[]) => {
    if (previousPageData && !previousPageData.length) return null
    return `/posts?page=${pageIndex}`;
  }

  const {
    data, 
    error, 
    size: page, 
    setSize: setPage, 
    isValidating, 
    mutate
  } = useSWRInfinite<Post[]>(getKey);
  const isInitialLoading = !data && !error;
  const posts: Post[] = data ? ([] as Post[]).concat(...data) : [];
  const { data: topSubs } = useSWR<Sub[]>(address, fetcher);
  
  return (
    <div className='flex max-w-5xl px-4 pt-5 mx-auto'>
      {/* 포스트 리스트 */}
      <div className='w-full md:mr-3 md:w-8/12'>  
        {isInitialLoading && <p className="text-lg text-center">Loading...</p>}
        {posts?.map((post) => (
          <PostCard
            key={post.identifier}
            post={post}
          />
        ))}
      </div>

      {/* 사이드바 */}
      <div className='hidden w-4/12 ml-3 md:block'>
        <div className='bg-white border rounded'>
          <div className='p-4 border-b'>
            <p className='text-lg font-semibold text-center'>상위 커뮤니티</p>
          </div>

          {/* 커뮤니티 리스트 */}
          <div>
            {topSubs?.map((sub) => (
              <div
                key={sub.name}
                className="flex items-center px-4 py-2 text-xs border-b"
              >
                <Link href={`/r/${sub.name}`}>
                  <span>
                    <Image
                      src={sub.imageUrl}
                      className="rounded-full cursor-pointer"
                      alt="Sub"
                      width={24}
                      height={24}
                    />
                  </span>
                </Link>
                <Link href={`/r/${sub.name}`}>
                  <span className='ml-2 font-bold hover:cursor-pointer'>
                    /r/{sub.name}
                  </span>
                </Link>
                <p className='ml-auto font-md'>{sub.postCount}</p>
              </div>
            ))}
          </div>
          
          {authenticated &&
            <div className='w-full py-6 text-center'>
              <Link href="/subs/create">
                <span className='w-full p-2 text-center text-white bg-gray-400 rounded'>
                  커뮤니티 만들기
                </span>
              </Link>
            </div>
          }
        </div>
      </div>

    </div>
  );
}

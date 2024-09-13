import { Post } from "../types";
import axios from "axios";
import useSWRInfinite from "swr/infinite";
import PostCard from "../components/PostCard";
import { useEffect, useState } from "react";
import MainSidebar from "../components/MainSidebar";

export default function Home() {
  const getKey = (pageIndex: number, previousPageData: Post[]) => {
    if (previousPageData && !previousPageData.length) return null
    return `/posts?page=${pageIndex}`;
  }

  const handlePostDelete = async (identifier: string, slug: string) => {
    try {
      await axios.delete(`/posts/${identifier}/${slug}`);
      mutate();
    } catch (error) {
      console.log(error);
    }
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

  const isPost = (item: any): item is Post => item && typeof item.identifier === 'string';
  const posts: Post[] = data ? ([] as Post[]).concat(...data).filter(isPost) : [];
  
  const [observedPost, setObservedPost] = useState("");

  // Infinite Scroll 기능 구현
  useEffect(() => {
    // post가 없다면 return
    if (!posts || posts.length === 0) return;
    // posts 배열 안 마지막 post의 id 가져오기
    const id = posts[posts.length-1].identifier;
    // posts 배열에 post가 추가돼서 마지막 post가 바뀌었다면
    // 바뀐 post 중 마지막 post를 observedPost로 지정
    if (id !== observedPost) {
      setObservedPost(id);
      observeElement(document.getElementById(id));
    }
  }, [posts]);

  const observeElement = (element: HTMLElement | null) => {
    if (!element) return;
    // 브라우저 Viewport와 설정한 Element의 교차점을 관찰
    const observer = new IntersectionObserver(
      // entries: IntersectionObserverEntry Instance의 배열
      (entries) => {
        // isIntersecting: 관찰 대상의 교차 상태 (Boolean)
        if (entries[0].isIntersecting === true) {
          console.log("Reached bottom of post");
          setPage(page + 1);
          observer.unobserve(element);
        }
      },
      // 옵저버가 실행되기 위해 타겟의 가시성이 얼마나 필요한지 백분율로 표시
      { threshold: 1 }
    );
    // 대상 요소의 관찰을 시작
    observer.observe(element);
  }

  return (
    <div className='flex'>
      {/* 사이드바 */}
      <div className='w-64 fixed left-0 top-0'>
        <MainSidebar />
      </div>

      {/* 포스트 리스트 */}
      <div className='ml-50 w-[calc(100%-26rem)] px-4 py-5 ml-2'>  
        {isInitialLoading && <p className="text-lg text-center">Loading...</p>}
        {posts?.map((post) => (
          <PostCard
            key={post.identifier}
            post={post}
            mutate={mutate}
            onDelete={handlePostDelete}
          />
        ))}
        {isValidating && posts.length > 0 && (
          <p className="text-lg text-center">Loading More..</p>
        )}
      </div>
    </div>
  );
}

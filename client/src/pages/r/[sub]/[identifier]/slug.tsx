import { Post } from '@/src/types';
import axios from 'axios';
import { useRouter } from 'next/router';
import useSWR from 'swr';

const PostPage = () => {
    const router = useRouter();
    const { sub, identifier, slug } = router.query;

    const { data: post, error } = useSWR<Post>(
        identifier && slug ? `/posts/${identifier}/${slug}` : null
    )
    return (
    <div>PostPage</div>
    )
}

export default PostPage
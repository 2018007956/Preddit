import { Post } from '@/src/types';
import axios from 'axios';
import { useRouter } from 'next/router';
import useSWR from 'swr';

const PostPage = () => {
    const router = useRouter();
    const { sub, identifier, slug } = router.query;

    const fetcher = async (url: string) => {
        try {
            const res = await axios.get(url);
            return res.data;
        } catch (error: any) {
            throw error.response.data;
        }
    }

    const { data: post, error } = useSWR<Post>(
        identifier && slug ? `/posts/${identifier}/${slug}` : null, fetcher
    )
    return (
    <div>PostPage</div>
    )
}

export default PostPage
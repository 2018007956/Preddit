import { useRouter } from 'next/router'
import React from 'react'
import useSWR from 'swr';

const UserPage = () => {
    const router = useRouter();
    const username = router.query.username;

    const { data, error } = useSWR<any>(username ? `/users/${username}` : null);
    return (
        <div>UserPage</div>
    )
}

export default UserPage
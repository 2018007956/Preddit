import React from 'react'
import { Post } from '../types'

interface PostCardProps {
    post: Post
}

const PostCard = ({ post: {
    identifier, slug, title, body, subName, createdAt, voteScore, userVote, commentCount, url, username, sub
} }: PostCardProps) => {
  return (
    <div>PostCard</div>
  )
}

export default PostCard
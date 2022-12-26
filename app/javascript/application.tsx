import {Route, Routes, Link, BrowserRouter, useParams} from 'react-router-dom'
import React, {useContext} from 'react'

interface CacheContext {
  product?: 'github' | 'gitlab'
  username?: string
}

export function Application({product, username}: {product: unknown; username: unknown}) {
  if (product !== 'github' && product !== 'gitlab') throw new Error(`Invalid product ${product}`)
  if (typeof username !== 'string') throw new Error('Username must be a string')

  return (
    <CacheContext.Provider value={{product, username}}>
      <BrowserRouter basename={`${product}/${username}`}>
        <Routes>
          <Route path="/" element={<Resume />} />,
          <Route path="posts" element={<PostIndex />} />,
          <Route path="posts/:postId" element={<Post />} />
        </Routes>
      </BrowserRouter>
    </CacheContext.Provider>
  )
}

function Resume() {
  const {product, username} = useCacheContext()
  console.log(product, username)

  return (
    <div>
      <h1>Resume</h1>
      <Link to="posts">posts</Link>
    </div>
  )
}

function PostIndex() {
  const {product, username} = useCacheContext()
  console.log(product, username)

  return (
    <div>
      <h1>Posts</h1>
      <Link to="./..">resume</Link>
      <Link to="some-post">post</Link>
    </div>
  )
}

function Post() {
  const {product, username} = useCacheContext()
  const {postId} = useParams()

  console.log(product, username, postId)

  return (
    <div>
      <h1>{postId}</h1>
      <Link to="./..">posts</Link>
    </div>
  )
}

const defaultCacheContext = {
  product: undefined,
  username: undefined
}

const CacheContext = React.createContext<CacheContext>(defaultCacheContext)

export function useCacheContext() {
  return useContext(CacheContext)
}

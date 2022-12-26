import {Route, Routes, Link, BrowserRouter, useParams} from 'react-router-dom'
import React, {ReactNode, useContext} from 'react'

type Product = 'github' | 'gitlab'

interface CacheContext {
  product?: Product
  username?: string
  postFor(id: string): any
}

export function Application({product, username}: {product: unknown; username: unknown}) {
  if (product !== 'github' && product !== 'gitlab') throw new Error(`Invalid product ${product}`)
  if (typeof username !== 'string') throw new Error('Username must be a string')

  return (
    <CacheContextProvider product={product} username={username}>
      <BrowserRouter basename={`${product}/${username}`}>
        <Routes>
          <Route path="/" element={<Resume />} />,
          <Route path="posts" element={<PostIndex />} />,
          <Route path="posts/:postId" element={<Post />} />
        </Routes>
      </BrowserRouter>
    </CacheContextProvider>
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
  const {postFor} = useCacheContext()
  const {postId} = useParams()

  if (postId === undefined) throw new Error('postId is required')

  const post = postFor(postId)

  return (
    <div>
      <h1>{postId}</h1>
      <Link to="./..">posts</Link>
    </div>
  )
}

const defaultCacheContext = {
  product: undefined,
  username: undefined,
  postFor: (id: string) => {
    throw new Error('invariant variation')
  }
}

const CacheContext = React.createContext<CacheContext>(defaultCacheContext)

function useCacheContext() {
  return useContext(CacheContext)
}

function CacheContextProvider({
  product,
  username,
  children
}: {
  product: Product
  username: string
  children: ReactNode
}) {
  return (
    <CacheContext.Provider
      value={{
        product,
        username,
        postFor: (id: string) => {
          console.log(product, username, id)
        }
      }}
    >
      {children}
    </CacheContext.Provider>
  )
}

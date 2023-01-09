import {Route, Routes, Link, BrowserRouter, useParams} from 'react-router-dom'
import React, {ReactNode, useContext, useEffect, useRef, useState} from 'react'
import {github, gitlab} from './fetcher'
import {marked} from 'marked'
import hljs from 'highlight.js'

marked.use({
  walkTokens: token => {
    if (token.type === 'heading') {
      token.depth += 1
    }
  }
})

type Product = 'github' | 'gitlab'
type Person = {name?: string; image?: string}
type Post = {title?: string; date?: Date; body?: string}
type PostWithAuthor = {author?: Person} & Post
type NetworkResource<T> =
  | {data: T; loading: false; error: undefined}
  | {data: undefined; loading: true; error: undefined}
  | {data: undefined; loading: false; error: Error}

type Error = 'NOT_FOUND' | 'SERVER_ERROR'

interface CacheContext {
  username?: string
  postFor(id: string): NetworkResource<PostWithAuthor>
}

export function Application({product, username}: {product: unknown; username: unknown}) {
  if (product !== 'github' && product !== 'gitlab') throw new Error(`Invalid product ${product}`)
  if (typeof username !== 'string') throw new Error('Username must be a string')

  return (
    <CacheProvider product={product} username={username}>
      <BrowserRouter basename={`${product}/${username}`}>
        <Routes>
          <Route path="/" element={<Resume />} />,
          <Route path="posts" element={<PostIndex />} />,
          <Route path="posts/:postId" element={<Post />} />
        </Routes>
      </BrowserRouter>
    </CacheProvider>
  )
}

function Resume() {
  const {username} = useCacheContext()
  console.log(username)

  return (
    <div>
      <h1>Resume</h1>
      <Link to="posts">posts</Link>
    </div>
  )
}

function PostIndex() {
  const {username} = useCacheContext()
  console.log(username)

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

  const {data: post, loading, error} = postFor(postId)

  useEffect(hljs.highlightAll, [post])

  if (loading) {
    return <div>Loading ...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  const date = post.date
  const dateValue = date && date.toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})
  const dateAttribute =
    date && `${date.getFullYear()}-${date.getMonth() + 1}-${String(date.getDate()).padStart(2, '0')}`

  const author = post.author

  return (
    <div className="post">
      <header>
        {author && (
          <>
            <div className="avatar">
              <img src={author.image} alt={`Image of ${author.name}`} />
            </div>
            <p className="author">{author.name}</p>
          </>
        )}

        <time dateTime={dateAttribute}>{dateValue}</time>
      </header>
      <article>
        <h1>{post.title}</h1>
        {post.body && <div dangerouslySetInnerHTML={{__html: marked.parse(post.body)}} />}
      </article>
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

function CacheProvider({product, username, children}: {product: Product; username: string; children: ReactNode}) {
  const source = useRef(product === 'github' ? github : gitlab)
  const [posts, setPosts] = useState<{[id: string]: PostWithAuthor | Error}>({})

  const postFor = (id: string): NetworkResource<PostWithAuthor> => {
    const post = posts[id]
    if (post && typeof post !== 'string') {
      return {
        data: post,
        loading: false,
        error: undefined
      }
    } else if (post && typeof post === 'string') {
      return {data: undefined, loading: false, error: post}
    } else {
      source.current
        .post(username, id)
        .then(post => {
          setPosts(currentPosts => ({...currentPosts, [id]: post}))
        })
        .catch(error => {
          setPosts(currentPosts => ({...currentPosts, [id]: 'NOT_FOUND'}))
        })

      return {data: undefined, loading: true, error: undefined}
    }
  }

  return <CacheContext.Provider value={{username, postFor}}>{children}</CacheContext.Provider>
}

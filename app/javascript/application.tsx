import {Route, Routes, Link, BrowserRouter, useParams} from 'react-router-dom'
import React, {ReactNode, useContext, useEffect, useRef, useState} from 'react'
import {github, gitlab} from './fetcher'
import {marked} from 'marked'
import hljs from 'highlight.js'
import {Preloader} from './Preloader'

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
  | {data: undefined; loading: false; error: string}

interface CacheContext {
  username?: string
  usePost(id: string): NetworkResource<PostWithAuthor>
  useResume(): any // TODO: Fix
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
  // const {data: post, loading, error} = resume()

  return (
    <div>
      <h1>Resume</h1>
      <Link to="posts">posts</Link>
    </div>
  )
}

function PostIndex() {
  const {username} = useCacheContext()

  return (
    <div>
      <h1>Posts</h1>
      <Link to="./..">resume</Link>
      <Link to="some-post">post</Link>
    </div>
  )
}

function Post() {
  const {usePost} = useCacheContext()
  const {postId} = useParams()

  if (postId === undefined) throw new Error('postId is required')

  const {data: post, loading, error} = usePost(postId)

  useEffect(hljs.highlightAll, [post])

  if (loading) return <Preloader />

  if (error !== undefined) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="post">
      <header>
        {post.author && (
          <Link to="/">
            <div className="avatar">
              <img src={post.author.image} alt={`Image of ${post.author.name}`} />
            </div>
            <p className="author">{post.author.name}</p>
          </Link>
        )}

        <Date value={post.date} />
      </header>
      <article>
        <h1>{post.title}</h1>
        {post.body && <div dangerouslySetInnerHTML={{__html: marked.parse(post.body)}} />}
      </article>
    </div>
  )
}

function Date({value}: {value?: Date}) {
  if (!value) return null

  const dateValue = value.toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})
  const dateAttribute = `${value.getFullYear()}-${value.getMonth() + 1}-${String(value.getDate()).padStart(2, '0')}`

  return <time dateTime={dateAttribute}>{dateValue}</time>
}

const defaultCacheContext = {
  product: undefined,
  username: undefined,
  usePost: (id: string) => {
    throw new Error('invariant variation')
  },
  useResume: () => {
    throw new Error('invariant variation')
  }
}

const CacheContext = React.createContext<CacheContext>(defaultCacheContext)

function useCacheContext() {
  return useContext(CacheContext)
}

function CacheProvider({product, username, children}: {product: Product; username: string; children: ReactNode}) {
  const source = useRef(product === 'github' ? github : gitlab)
  const [posts, setPosts] = useState<{[id: string]: PostWithAuthor | string}>({})
  const [resume, setResume] = useState<any | undefined>()

  const usePost = (id: string): NetworkResource<PostWithAuthor> => {
    const post = posts[id]
    if (post && typeof post !== 'string') {
      return {data: post, loading: false, error: undefined}
    } else if (post && typeof post === 'string') {
      return {data: undefined, loading: false, error: post}
    } else {
      source.current
        .post(username, id)
        .then(post => {
          setPosts(currentPosts => ({...currentPosts, [id]: post}))
        })
        .catch(error => {
          setPosts(currentPosts => ({...currentPosts, [id]: error}))
        })

      return {data: undefined, loading: true, error: undefined}
    }
  }

  const useResume = (): NetworkResource<PostWithAuthor> => {
    if (resume && typeof resume !== 'string') {
      return {data: resume, loading: false, error: undefined}
    } else if (resume && typeof resume === 'string') {
      return {data: undefined, loading: false, error: resume}
    } else {
      source.current.resume(username).then(setResume).catch(setResume)

      return {data: undefined, loading: true, error: undefined}
    }
  }

  return <CacheContext.Provider value={{username, usePost, useResume}}>{children}</CacheContext.Provider>
}

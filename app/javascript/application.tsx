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

type Person = {name?: string; image?: string}
type Resume = Person & {}
type Product = 'github' | 'gitlab'
type Post = {title?: string; date?: Date; body?: string}
type NetworkResource<T> =
  | {data: T; loading: false; error: undefined}
  | {data: undefined; loading: true; error: undefined}
  | {data: undefined; loading: false; error: string}

interface CacheContext {
  username?: string
  usePost(id: string): NetworkResource<Post>
  useResume(): NetworkResource<Resume>
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
  const {useResume, usePost} = useCacheContext()
  const {postId} = useParams()

  if (postId === undefined) throw new Error('postId is required')

  const {data: resume, loading: loadingResume, error: resumeError} = useResume()
  const {data: post, loading: loadingPost, error: postError} = usePost(postId)

  if (loadingPost || loadingResume) return <Preloader />

  return (
    <div className="post">
      <header>
        <PostAuthor author={resume} error={resumeError} />
        {post && <Date value={post.date} />}
      </header>
      <article>
        <PostBody post={post} error={postError} />
      </article>
    </div>
  )
}

function PostAuthor({author, error}: {author: Person | undefined; error?: string}) {
  if (error || !author) {
    return <div className="error">{error}</div>
  }

  return (
    <Link to="/">
      <div className="avatar">
        <img src={author.image} alt={`Image of ${author.name}`} />
      </div>
      <p className="author">{author.name}</p>
    </Link>
  )
}

function PostBody({post, error}: {post: Post | undefined; error?: string}) {
  useEffect(() => {
    if (!post) return
    hljs.highlightAll()
  }, [post])

  if (error || !post) {
    return <div className="error">{error}</div>
  }

  return (
    <>
      <h1>{post.title}</h1>
      {post.body && <div dangerouslySetInnerHTML={{__html: marked.parse(post.body)}} />}
    </>
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
  const [posts, setPosts] = useState<{[id: string]: Post | string}>({})
  const [resume, setResume] = useState<any | undefined>()

  const usePost = (id: string): NetworkResource<Post> => {
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

  const useResume = (): NetworkResource<Resume> => {
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

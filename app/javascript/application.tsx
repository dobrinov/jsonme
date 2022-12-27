import {Route, Routes, Link, BrowserRouter, useParams} from 'react-router-dom'
import React, {ReactNode, useContext, useState} from 'react'
import {github, gitlab} from './fetcher'

type Product = 'github' | 'gitlab'
type Person = {name: string; image: string}
type Post = {title: string; date: Date; body: string}
type NetworkResource<T> = {data: T; loading: false} | {data: undefined; loading: true}
type Foo = {author: Partial<Person>} & Partial<Post>

interface CacheContext {
  username?: string
  postFor(id: string): NetworkResource<Foo>
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

  const {data: post, loading} = postFor(postId)

  if (loading) {
    return <div>Loading ...</div>
  }

  const date = post.date
  const dateValue = date && date.toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})
  const dateAttribute =
    date && `${date.getFullYear()}-${date.getMonth() + 1}-${String(date.getDate()).padStart(2, '0')}`

  return (
    <div className="post">
      <header>
        <div className="avatar">
          <img src={post.author.image} alt={`Image of ${post.author.name}`} />
        </div>
        <p className="author">{post.author.name}</p>
        <time dateTime={dateAttribute}>{dateValue}</time>
      </header>
      <article>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{__html: post.body ?? ''}} />
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

function CacheContextProvider({
  product,
  username,
  children
}: {
  product: Product
  username: string
  children: ReactNode
}) {
  const [source, setSource] = useState(product === 'github' ? github : gitlab)
  const [posts, setPosts] = useState<{[id: string]: Foo}>({})

  const postFor = (id: string): NetworkResource<Foo> => {
    if (posts[id]) {
      return {
        data: {
          author: {name: 'Deyan Dobrinov', image: 'https://avatars.githubusercontent.com/u/996877?v=4'},
          title: 'Hello, blogging!',
          date: new Date(),
          body: '<p>That is the blog folks!</p>'
        },
        loading: false
      }
    } else {
      source.post(username, id).then(post => setPosts(currentPosts => ({...currentPosts, [id]: post})))

      return {data: undefined, loading: true}
    }
  }

  return <CacheContext.Provider value={{username, postFor}}>{children}</CacheContext.Provider>
}

import {Route, Routes, Link, BrowserRouter, useParams} from 'react-router-dom'
import React, {ReactNode, useContext, useEffect, useRef, useState} from 'react'
import {github, gitlab, LegacyParseResult} from './fetcher'
import {marked} from 'marked'
import hljs from 'highlight.js'
import {Preloader} from './Preloader'
import {allSuccessfullyParsed, Period, Post as PostType, Resume as ResumeType} from './types'

marked.use({
  walkTokens: token => {
    if (token.type === 'heading') {
      token.depth += 1
    }
  }
})

type Product = 'github' | 'gitlab'
type NetworkResource<T> =
  | {data: T; loading: false; error: undefined}
  | {data: undefined; loading: true; error: undefined}
  | {data: undefined; loading: false; error: string}

interface CacheContext {
  username?: string
  usePost(id: string): NetworkResource<LegacyParseResult<PostType>>
  useResume(): NetworkResource<LegacyParseResult<ResumeType>>
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
  const {useResume} = useCacheContext()

  const {data, loading, error} = useResume()

  if (loading) return <Preloader />

  if (error || !data) {
    return <div className="error">{error}</div>
  }

  const {image, name, summary, location, employments} = data

  employments?.map(employment => console.log(employment))

  return (
    <div className="resume-layout">
      <div className="resume">
        {image && <Avatar image={image} name={name} />}
        {name && <h1 className="name">{name}</h1>}
        {summary && <div className="summary">{summary}</div>}

        {location && (
          <Section title="Location">
            <p>
              {[location.city, location.state, location.country]
                .filter(component => component !== undefined)
                .join(', ')}
            </p>
          </Section>
        )}

        {employments &&
          employments.length > 0 &&
          (allSuccessfullyParsed(employments) ? (
            <Section title="Experience">
              <Timeline startingYear={startingYear(employments)}>
                <ul>
                  {employments.map(employment => (
                    <li>
                      <div className="summary">
                        <h3>Employer name</h3>
                        <aside />
                        <a href="" target="_blank" rel="nofollow">
                          www.example.com
                        </a>
                        <div>May 2010 - present</div>
                      </div>
                      <div className="details">
                        <p>{employment.summary}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Timeline>
            </Section>
          ) : (
            <div>Some employments were not parsed successfully</div>
          ))}

        <Link to="posts">posts</Link>
      </div>
    </div>
  )
}

function PostIndex() {
  const {useResume} = useCacheContext()

  const {data: resume, loading: loadingResume, error: resumeError} = useResume()

  return (
    <div className="posts">
      <header>
        <Link to="./..">
          <Avatar {...resume} />
          <p className="author">{resume?.name}</p>
        </Link>
      </header>
      <div>
        <h1>Posts</h1>
        <Link to="hello-blogging">Hello, blogging!</Link>
      </div>
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
        <PostAuthor resume={resume} error={resumeError} />
        {post && <Date value={post.date} />}
      </header>
      <article>
        <PostBody post={post} error={postError} />
      </article>
    </div>
  )
}

function Avatar({image, name}: {image?: string; name?: string}) {
  const alt = name ? `Image of ${name}` : undefined

  const unknown = '/whitenoice.gif'

  return (
    <div className="avatar">
      <img
        src={image ?? unknown}
        alt={alt}
        onError={event => {
          if (eventTargetIsHtmlImageElement(event.target)) {
            event.target.src = unknown
          }
        }}
      />
    </div>
  )
}

function PostAuthor({resume, error}: {resume?: LegacyParseResult<ResumeType>; error?: string}) {
  if (error || !resume) {
    return <div className="error">{error}</div>
  }

  return (
    <Link to="./..">
      <Avatar {...resume} />
      <p className="author">{resume.name}</p>
    </Link>
  )
}

function PostBody({post, error}: {post: LegacyParseResult<PostType> | undefined; error?: string}) {
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
  const [posts, setPosts] = useState<{[id: string]: LegacyParseResult<PostType> | string | undefined}>({})
  const [resume, setResume] = useState<LegacyParseResult<ResumeType> | string | undefined>()

  const usePost = (id: string): NetworkResource<LegacyParseResult<PostType>> => {
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
          if (error instanceof Error) {
            setPosts(currentPosts => ({...currentPosts, [id]: error.message}))
          } else {
            setPosts(currentPosts => ({...currentPosts, [id]: 'Cannot fetch post'}))
          }
        })

      return {data: undefined, loading: true, error: undefined}
    }
  }

  const useResume = (): NetworkResource<LegacyParseResult<ResumeType>> => {
    if (resume && typeof resume !== 'string') {
      return {data: resume, loading: false, error: undefined}
    } else if (resume && typeof resume === 'string') {
      return {data: undefined, loading: false, error: resume}
    } else {
      source.current
        .resume(username)
        .then(setResume)
        .catch(error => {
          if (error instanceof Error) {
            setResume(error.message)
          } else {
            setResume('Cannot fetch resume')
          }
        })

      return {data: undefined, loading: true, error: undefined}
    }
  }

  return <CacheContext.Provider value={{username, usePost, useResume}}>{children}</CacheContext.Provider>
}

function eventTargetIsHtmlImageElement(target: EventTarget): target is HTMLImageElement {
  return 'src' in target
}

function Section({title, children}: {title: string; children: ReactNode}) {
  return (
    <div className="section">
      <h2 className="heading">{title}</h2>
      {children}
    </div>
  )
}

function Timeline({startingYear, children}: {startingYear: number; children: ReactNode}) {
  return (
    <div className="timeline">
      <aside>present</aside>
      {children}
      <aside>{startingYear}</aside>
    </div>
  )
}

function startingYear(temporals: {period: Period}[]): number {
  return Math.min(...temporals.map(temporal => temporal.period.from.year))
}

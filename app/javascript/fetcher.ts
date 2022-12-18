import yaml from 'js-yaml'
import {z} from 'zod'

const SCHEMA = {
  person: z.object({
    name: z.string().catch('Unknown author'),
    image: z.string().catch('missing.png')
  })
}

type Person = z.infer<typeof SCHEMA.person>

type Post = {
  date: Date
  title: string
  body: string
}

type PostWithAuthor = Post & {author: Person}

type PostSummary = {}

type Resume = Person & {}

type Profile = {name: string; image: string; summary: string}

type ProfileWithPosts = Profile & {posts: PostSummary[]}

type FrontMatter = {
  title: string
  date: Date
  startIndex: number
  endIndex: number
}

const EMPTY_RESUME: Resume = {
  name: 'Unknown author',
  image: 'missing'
}

export const github = {
  resume: (username: string): Promise<Resume> => {
    return fetch(`https://raw.githubusercontent.com/${username}/me/main/me.json`)
      .then(response => response.json())
      .then(parseResume)
      .catch(() => EMPTY_RESUME)
  },
  post: (username: string, handle: string): Promise<PostWithAuthor> => {
    return Promise.all([
      github.resume(username),
      fetch(`https://raw.githubusercontent.com/${username}/me/main/posts/${handle}.md`)
        .then(response => response.text())
        .then(parsePost)
    ]).then(([resume, post]) => ({
      author: {name: resume.name, image: resume.image},
      title: post.title,
      date: post.date,
      body: post.body
    }))
  }
}

const gitlab = {
  // post: (username: string, handle: string): Promise<Post & {author: Person}> => {},
  // posts: (username: string): ProfileWithPosts => {
  //   return {
  //     name: 'Jonh Doe',
  //     image: 'https://www.example.com/',
  //     summary: 'This is the profile of John Doe',
  //     posts: []
  //   }
  // },
  // resume: (username: string): Resume => {
  //   return {}
  // }
}

function parseFrontMatter(markdown: string): FrontMatter | undefined {
  const matches = [...markdown.matchAll(/---\s?\n+/g)]

  const startMarker = matches[0]
  const endMarker = matches[1]

  if (startMarker.index === undefined || endMarker.index === undefined) return undefined

  const parsed = yaml.load(markdown.substring(startMarker.index + endMarker[0].length - 1, endMarker.index)) as any

  if (!('title' in parsed && typeof parsed.title === 'string')) return undefined
  if (!('date' in parsed && parsed.date instanceof Date)) return undefined

  return {
    title: parsed.title,
    date: parsed.date,
    startIndex: startMarker.index,
    endIndex: endMarker.index + endMarker[0].length
  }
}

function parseResume(json: any): Resume {
  return SCHEMA.person.parse(json)
}

function parsePost(text: string): Post {
  const frontMatter = parseFrontMatter(text)
  const body = text.substring(frontMatter ? frontMatter.endIndex : 0)

  return {
    title: frontMatter ? frontMatter.title : 'Unknown title',
    date: frontMatter ? frontMatter.date : new Date(),
    body
  }
}

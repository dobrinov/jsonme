import yaml from 'js-yaml'
import {z} from 'zod'

const SCHEMA = {
  person: z.object({
    name: z.string(),
    image: z.string().url()
  }),
  post: z.object({
    title: z.string(),
    date: z.date(),
    body: z.string()
  })
}

type UnsuccessfullyParsed<T> = Partial<T> & {errors: string[]}
type ParseResult<T> = T | UnsuccessfullyParsed<T>

type Person = z.infer<typeof SCHEMA.person>
type Post = z.infer<typeof SCHEMA.post>
type Resume = Person & {}

type FrontMatter = {
  title: string
  date: Date
  startIndex: number
  endIndex: number
}

export const github = {
  resume: (username: string): Promise<ParseResult<Resume>> => {
    return fetch(`https://raw.githubusercontent.com/${username}/me/main/me.json`)
      .then(response => response.json())
      .then(parseResume)
      .catch(() => ({
        errors: ['Oops. Something went wrong. Try again!']
      }))
  },
  post: (username: string, handle: string): Promise<ParseResult<Post> & {author: ParseResult<Person>}> => {
    return Promise.all([
      github.resume(username),
      fetch(`https://raw.githubusercontent.com/${username}/me/main/posts/${handle}.md`)
        .then(response => response.text())
        .then(parsePost)
    ]).then(([resume, post]) => {
      const x = {
        author: {name: resume.name, image: resume.image, errors: []},
        title: post.title,
        date: post.date,
        body: post.body,
        errors: []
      }
      return x
    })
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

function parseResume(json: any): ParseResult<Resume> {
  const result = SCHEMA.person.safeParse({name: 'Didko'})

  if (result.success) {
    return result.data
  } else {
    return {errors: ['fuk']}
  }
}

function parsePost(text: string): ParseResult<Post> {
  const frontMatter = parseFrontMatter(text)
  const body = text.substring(frontMatter ? frontMatter.endIndex : 0)

  return {
    title: frontMatter ? frontMatter.title : 'Unknown title',
    date: frontMatter ? frontMatter.date : new Date(),
    body
  }
}

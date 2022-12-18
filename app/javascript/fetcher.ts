import yaml from 'js-yaml'

type ParseResult<T> = Partial<T> & {errors: {[K in keyof T]?: string} & {general?: string[]}}

type Person = {name: string; image: string}
type Post = {title: string; date: Date; body: string}
type Resume = Person & {}

type FrontMatter = {
  title: string
  date: Date
  startIndex: number
  endIndex: number
}

const URL_REGEX =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/

export const github = {
  resume: (username: string): Promise<ParseResult<Resume>> => {
    return fetch(`https://raw.githubusercontent.com/${username}/me/main/me.json`)
      .then(response => response.json())
      .then(parseResume)
  },
  post: (username: string, handle: string): Promise<ParseResult<Post> & {author: ParseResult<Person>}> => {
    return Promise.all([
      github.resume(username),
      fetch(`https://raw.githubusercontent.com/${username}/me/main/posts/${handle}.md`)
        .then(response => response.text())
        .then(parsePost)
    ]).then(([resume, post]) => ({
      author: resume,
      ...post
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

function parseResume(json: unknown): ParseResult<Resume> {
  const resume: ParseResult<Resume> = {errors: {}}

  if (json === null) {
    return {errors: {general: ['Resume unavailable']}}
  }

  if (typeof json !== 'object') {
    return {errors: {general: ['The resume should be a JSON object']}}
  }

  // NAME
  if ('name' in json) {
    if (typeof json.name === 'string') {
      resume.name = json.name
    } else {
      resume.errors.image = 'Name is not a string'
    }
  } else {
    resume.errors.image = 'Name is not specified'
  }

  // IMAGE
  if ('image' in json) {
    if (typeof json.image === 'string' && json.image.match(URL_REGEX)) {
      resume.image = json.image
    } else {
      resume.errors.image = 'Image is not an URL'
    }
  } else {
    resume.errors.image = 'Image is not specified'
  }

  return resume
}

function parsePost(text: string): ParseResult<Post> {
  const frontMatter = parseFrontMatter(text)
  const body = text.substring(frontMatter ? frontMatter.endIndex : 0)

  return {
    title: frontMatter?.title,
    date: frontMatter?.date,
    body,
    errors: {}
  }
}

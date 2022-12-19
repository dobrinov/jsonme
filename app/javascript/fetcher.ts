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

function parseResume(json: unknown): ParseResult<Resume> {
  const resume: ParseResult<Resume> = {errors: {}}

  if (json === null) return {errors: {general: ['Resume unavailable']}}
  if (!isObject(json)) return {errors: {general: ['The resume should be a JSON object']}}

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
  const post: ParseResult<Post> = {errors: {}}

  const frontMatterMarkers = [...text.matchAll(/---\s?\n+/g)]

  const frontMatterStartMarker = {startIndex: 0, endIndex: 0, length: 0}
  if (frontMatterMarkers[0] && frontMatterMarkers[0].index !== undefined) {
    frontMatterStartMarker.startIndex = frontMatterMarkers[0].index
    frontMatterStartMarker.endIndex = frontMatterMarkers[0].index + frontMatterMarkers[0][0].length - 1
    frontMatterStartMarker.length = frontMatterMarkers[0].length
  }

  const frontMatterEndMarker = {startIndex: 0, endIndex: 0, length: 0}
  if (frontMatterMarkers[1] && frontMatterMarkers[1].index !== undefined) {
    frontMatterEndMarker.startIndex = frontMatterMarkers[1].index
    frontMatterEndMarker.endIndex = frontMatterMarkers[1].index + frontMatterMarkers[1][0].length - 1
    frontMatterEndMarker.length = frontMatterMarkers[1].length
  }

  const hasFrontMatter = frontMatterEndMarker.startIndex !== frontMatterStartMarker.startIndex

  if (hasFrontMatter) {
    try {
      const parsed = yaml.load(text.substring(frontMatterStartMarker.endIndex, frontMatterEndMarker.startIndex)) as any

      if ('title' in parsed && typeof parsed.title === 'string') {
        post.title = parsed.title
      } else {
        post.errors.title = 'Title is not specified'
      }

      if ('date' in parsed && parsed.date instanceof Date) {
        post.date = parsed.date
      } else {
        post.errors.date = 'Date is not specified'
      }
    } catch (error) {
      if (isYamlParseError(error)) {
        post.errors.general = [`${error.reason}${error.stack}`]
      }
    }
  }

  post.body = text.substring(frontMatterEndMarker.endIndex)

  return post
}

function isObject(value: unknown): value is {[key: string]: unknown} {
  return typeof value === 'object'
}

function isYamlParseError(error: any): error is {reason: string; stack: string} {
  return 'reason' in error && 'stack' in error
}

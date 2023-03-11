import yaml from 'js-yaml'
import {Person, Post, Resume, Location, LegacyEmployment, Employment, ParseResult} from './types'

export type LegacyParseResult<T> = T & {errors: {[K in keyof T]?: string} & {general?: string[]}}

const URL_REGEX =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/

export const github = {
  resume: (username: string): Promise<LegacyParseResult<Resume>> => {
    return fetch(`https://raw.githubusercontent.com/${username}/me/main/me.json`)
      .then(response => response.json())
      .then(parseResume)
  },
  post: (username: string, handle: string): Promise<LegacyParseResult<Post>> => {
    return fetch(`https://raw.githubusercontent.com/${username}/me/main/posts/${handle}.md`)
      .then(response => {
        if (response.status === 200) {
          return response.text()
        } else if (response.status === 404) {
          throw new Error('The post cannot be found.')
        } else {
          throw new Error('Oops. Something went wrong. Try again!')
        }
      })
      .then(parsePost)
  }
}

export const gitlab = {
  resume: (username: string): Promise<LegacyParseResult<Resume>> => {
    // TODO: Change this with Gitlab logic
    return fetch(`https://raw.githubusercontent.com/${username}/me/main/me.json`)
      .then(response => response.json())
      .then(parseResume)
  },
  post: (username: string, handle: string): Promise<LegacyParseResult<Post> & {author: LegacyParseResult<Person>}> => {
    const query = `
    query Post($fullPath: ID!, $postPath: String!) {
      project(fullPath: $fullPath) {
        repository {
          blobs(ref: "main", paths: ["me.json", $postPath]) {
            nodes {
              path
              name
              rawBlob
            }
          }
        }
      }
    }
  `

    return fetch('https://gitlab.com/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({query, variables: {fullPath: `${username}/me`, postPath: `posts/${handle}.md`}})
    })
      .then(r => r.json())
      .then(data => {
        const rawResume = JSON.parse(data.data.project.repository.blobs.nodes[0].rawBlob)
        const rawPost = data.data.project.repository.blobs.nodes[1].rawBlob

        // TODO: Handle errors

        const resume = parseResume(rawResume)
        const post = parsePost(rawPost)

        return {
          author: resume,
          ...post
        }
      })
  }
}

function parseResume(json: unknown): LegacyParseResult<Resume> {
  const resume: LegacyParseResult<Resume> = {errors: {}}

  if (json === null) return {errors: {general: ['Resume unavailable']}}
  if (!isObject(json)) return {errors: {general: ['The resume should be a JSON object']}}

  // NAME
  if ('name' in json) {
    if (typeof json.name === 'string') {
      resume.name = json.name
    } else {
      resume.errors.image = 'Name must be a string'
    }
  } else {
    resume.errors.image = 'Name is not specified'
  }

  // IMAGE
  if ('image' in json) {
    if (typeof json.image === 'string' && json.image.match(URL_REGEX)) {
      resume.image = json.image
    } else {
      resume.errors.image = 'Image must be an URL'
    }
  } else {
    resume.errors.image = 'Image is not specified'
  }

  // SUMMARY
  if ('summary' in json) {
    if (typeof json.summary === 'string') {
      resume.summary = json.summary
    } else {
      resume.errors.summary = 'The summary must be a string'
    }
  }

  // LOCATION
  if ('location' in json) {
    const location = parseLocation(json.location)

    if (location) {
      if (location.errors.general) {
        resume.errors.location = location.errors.general.join(', ')
      } else {
        resume.location = location
      }
    }
  }

  // EMPLOYMENTS
  if ('employments' in json) {
    if (Array.isArray(json.employments)) {
      resume.employments = json.employments.map(employment => Employment.parse(employment))
    } else {
      resume.errors.employments = 'Employments must be an array'
    }
  }

  return resume
}

function parseLocation(json: unknown): LegacyParseResult<Location> | undefined {
  const location: LegacyParseResult<Location> = {errors: {}}

  if (json === null) return undefined
  if (!isObject(json)) return {errors: {general: ['Location must be an object']}}

  if ('city' in json) {
    if (typeof json.city === 'string') {
      location.city = json.city
    } else {
      location.errors.city = 'City must be a string'
    }
  }

  if ('state' in json) {
    if (typeof json.state === 'string') {
      location.state = json.state
    } else {
      location.errors.state = 'State must be a string'
    }
  }

  if ('country' in json) {
    if (typeof json.country === 'string') {
      location.country = json.country
    } else {
      location.errors.country = 'Country must be a string'
    }
  }

  if (location.city === undefined && location.state === undefined && location.country === undefined) {
    return {errors: {general: ['Location must be an object with city, state (optional) and coutnry.']}}
  }

  return location
}

function parsePost(text: string): LegacyParseResult<Post> {
  const post: LegacyParseResult<Post> = {errors: {}}

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

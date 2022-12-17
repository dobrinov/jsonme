import yaml from 'js-yaml'

type Post = {
  date: Date
  title: string
  body: string
}

type PostWithAuthor = Post & {author: Person}

type Person = {
  name: string
  image: string
}

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

export const github = {
  resume: (username: string): Promise<Resume> => {
    return fetch(`https://raw.githubusercontent.com/${username}/me/main/me.json`).then(response => response.json())
  },
  post: (username: string, handle: string): Promise<PostWithAuthor> => {
    return Promise.all([
      github.resume(username),
      fetch(`https://raw.githubusercontent.com/${username}/me/main/posts/${handle}.md`)
        .then(response => response.text())
        .then(text => {
          const frontMatter = parseFrontMatter(text)
          const markdown = text.substring(frontMatter.endIndex)

          return {frontMatter, markdown}
        })
    ]).then(([resume, post]) => {
      const {name, image} = resume
      const {
        frontMatter: {title, date},
        markdown: body
      } = post

      return {
        author: {name, image},
        title,
        date,
        body
      }
    })
  }
}

const x = github.post('dobrinov', 'hello-blogging').then(post => console.log(post))

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

function parseFrontMatter(markdown: string): FrontMatter {
  const matches = [...markdown.matchAll(/---\s?\n+/g)]

  const startMarker = matches[0]
  const endMarker = matches[1]

  if (!startMarker.index || !endMarker.index) {
    return {
      title: 'Unknown title',
      date: new Date(),
      startIndex: 0,
      endIndex: 0
    }
  }

  const parsed = yaml.load(markdown.substring(startMarker.index + endMarker[0].length - 1, endMarker.index)) as any

  let title: string
  let date: Date

  if ('title' in parsed && typeof parsed.title === 'string') {
    title = parsed.title
  } else {
    title = 'Unknown title'
  }

  if ('date' in parsed && parsed.date instanceof Date) {
    date = parsed.date
  } else {
    date = new Date()
  }

  return {
    title,
    date,
    startIndex: startMarker.index,
    endIndex: endMarker.index + endMarker[0].length
  }
}

function parseResume(value: string): Resume {
  return {
    name: '',
    image: ''
  }
}

function parsePost(value: string): Post {
  return {
    title: '',
    date: new Date(),
    body: 'string'
  }
}

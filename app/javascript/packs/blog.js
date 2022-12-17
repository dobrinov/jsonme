import {marked} from 'marked'
import {github} from '../fetcher.ts'

document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.querySelector('.js-post')
  const {product, username: escapedUsername, post} = trigger.dataset
  trigger.remove()

  const username = escapedUsername.replace('-', '.')

  if (product === 'github') {
    github.post(username, post).then(renderPost)
  } else if (product === 'gitlab') {
  } else {
    throw new Error(`Unsupported product "${product}"`)
  }
})

function renderPost(post) {
  marked.use({
    walkTokens: token => {
      if (token.type === 'heading') {
        token.depth += 1
      }
    }
  })
  const header = document.createElement('header')
  const article = document.createElement('article')
  const articleHtml = post.body
  article.innerHTML = marked.parse(articleHtml)

  const h1 = document.createElement('h1')
  h1.innerHTML = post.title

  const avatar = document.createElement('div')
  avatar.className = 'avatar'

  const img = document.createElement('img')
  img.src = post.author.image
  img.alt = `Image of ${post.author.name}`
  img.onerror = () => {
    img.src = 'http://localhost:3000/whitenoice.gif'
  }

  const name = document.createElement('p')
  name.className = 'author'
  name.innerHTML = post.author.name || 'UNKNOWN AUTHOR'

  const date = document.createElement('time')

  date.setAttribute(
    'datetime',
    `${post.date.getFullYear()}-${post.date.getMonth() + 1}-${String(post.date.getDate()).padStart(2, '0')}`
  )

  date.innerHTML = post.date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  document.title = post.title

  const description = `${articleHtml.replace(/(<([^>]+)>)/gi, '').slice(0, 200)}...`

  const metaDescription = document.createElement('meta')
  metaDescription.setAttribute('name', 'description')
  metaDescription.setAttribute('content', description)

  const ogDescription = document.createElement('meta')
  ogDescription.setAttribute('property', 'og:description')
  ogDescription.setAttribute('content', description)

  const metaOgTitle = document.createElement('meta')
  metaOgTitle.setAttribute('property', 'og:title')
  metaOgTitle.setAttribute('content', post.title)

  const metaOgUrl = document.createElement('meta')
  metaOgUrl.setAttribute('property', 'og:url')
  metaOgUrl.setAttribute('content', document.location)

  const metaOgImage = document.createElement('meta')
  metaOgImage.setAttribute('property', 'og:image')
  metaOgImage.setAttribute('content', post.author.image)

  const head = document.head
  head.append(metaDescription)
  head.append(metaOgTitle)
  head.append(metaOgUrl)
  head.append(metaOgImage)
  head.append(ogDescription)

  article.prepend(h1)
  avatar.append(img)
  header.append(avatar)
  header.append(name)
  header.append(date)
  document.body.append(header)
  document.body.append(article)
}

function fetchGitlabPost(username, post) {
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
    body: JSON.stringify({query, variables: {fullPath: `${username}/me`, postPath: `posts/${post}.md`}})
  })
    .then(r => r.json())
    .then(data => {
      const profile = JSON.parse(data.data.project.repository.blobs.nodes[0].rawBlob)
      const post = data.data.project.repository.blobs.nodes[1].rawBlob
      const frontMatter = parseFrontMatter(post)
      const markdown = post.substring(frontMatter.endIndex)

      return [profile, {frontMatter, markdown}]
    })
}

function fetchGitlabPosts(username, post) {
  const fullPath = `${username}/me`
  const query = `
    query Post($fullPath: ID!) {
      project(fullPath: $fullPath) {
        repository {
          tree(ref: "main", path: "posts") {
            blobs {
              nodes {
                name
              }
            }
          }
          blobs(ref: "main", paths: ["me.json"]) {
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

  fetch('https://gitlab.com/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({query, variables: {fullPath}})
  })
    .then(r => r.json())
    .then(data => console.log('data returned:', data))
}

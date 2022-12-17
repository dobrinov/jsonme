import {marked} from 'marked'
import yaml from 'js-yaml'
import {github} from '../fetcher.ts'

function parseFrontMatter(markdown) {
  const matches = [...markdown.matchAll(/---\s?\n+/g)]

  const startMarker = matches[0]
  const endMarker = matches[1]

  const parsed = yaml.load(markdown.substring(startMarker.index + endMarker[0].length - 1, endMarker.index))

  return {
    title: parsed.title,
    date: parsed.date,
    startIndex: startMarker.index,
    endIndex: endMarker.index + endMarker[0].length
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.querySelector('.js-post')
  const {product, username: escapedUsername, post} = trigger.dataset
  trigger.remove()

  const username = escapedUsername.replace('-', '.')

  if (product === 'github') {
    github.post(username, post).then(post => console.log(post))
    fetchGithubPost(username, post).then(([profile, post]) => renderPost(profile, post))
  } else if (product === 'gitlab') {
    fetchGitlabPost(username, post).then(([profile, post]) => renderPost(profile, post))
  } else {
    throw new Error(`Unsupported product "${product}"`)
  }
})

async function fetchGithubPost(username, post) {
  return await Promise.all([
    fetch(`https://raw.githubusercontent.com/${username}/me/main/me.json`).then(response => response.json()),
    fetch(`https://raw.githubusercontent.com/${username}/me/main/posts/${post}.md`)
      .then(response => response.text())
      .then(text => {
        const frontMatter = parseFrontMatter(text)
        const markdown = text.substring(frontMatter.endIndex)

        return {frontMatter, markdown}
      })
  ])
}

function renderPost(profile, post) {
  marked.use({
    walkTokens: token => {
      if (token.type === 'heading') {
        token.depth += 1
      }
    }
  })
  const header = document.createElement('header')
  const article = document.createElement('article')
  const articleHtml = post.markdown
  article.innerHTML = marked.parse(articleHtml)

  const h1 = document.createElement('h1')
  h1.innerHTML = post.frontMatter.title

  const avatar = document.createElement('div')
  avatar.className = 'avatar'

  const img = document.createElement('img')
  img.src = profile.image
  img.alt = `Image of ${profile.name}`
  img.onerror = () => {
    img.src = 'http://localhost:3000/whitenoice.gif'
  }

  const name = document.createElement('p')
  name.className = 'author'
  name.innerHTML = profile.name || 'UNKNOWN AUTHOR'

  const date = document.createElement('time')

  date.setAttribute(
    'datetime',
    `${post.frontMatter.date.getFullYear()}-${post.frontMatter.date.getMonth() + 1}-${String(
      post.frontMatter.date.getDate()
    ).padStart(2, '0')}`
  )

  date.innerHTML = post.frontMatter.date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  document.title = post.frontMatter.title

  const description = `${articleHtml.replace(/(<([^>]+)>)/gi, '').slice(0, 200)}...`

  const metaDescription = document.createElement('meta')
  metaDescription.setAttribute('name', 'description')
  metaDescription.setAttribute('content', description)

  const ogDescription = document.createElement('meta')
  ogDescription.setAttribute('property', 'og:description')
  ogDescription.setAttribute('content', description)

  const metaOgTitle = document.createElement('meta')
  metaOgTitle.setAttribute('property', 'og:title')
  metaOgTitle.setAttribute('content', post.frontMatter.title)

  const metaOgUrl = document.createElement('meta')
  metaOgUrl.setAttribute('property', 'og:url')
  metaOgUrl.setAttribute('content', document.location)

  const metaOgImage = document.createElement('meta')
  metaOgImage.setAttribute('property', 'og:image')
  metaOgImage.setAttribute('content', profile.image)

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

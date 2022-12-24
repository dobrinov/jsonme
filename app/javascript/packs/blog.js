import {marked} from 'marked'
import {github, gitlab} from '../fetcher.ts'
import hljs from 'highlight.js'
import 'highlight.js/styles/base16/solarized-dark.css'

document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.querySelector('.js-post')
  const {product, username: escapedUsername, post} = trigger.dataset
  trigger.remove()

  const username = escapedUsername.replace('-', '.')

  if (product === 'github') {
    github.post(username, post).then(renderPost)
  } else if (product === 'gitlab') {
    gitlab.post(username, post).then(renderPost)
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

  const title = post.title ?? 'Untitled post'
  const h1 = document.createElement('h1')
  h1.innerHTML = title
  document.title = title

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
  name.innerHTML = post.author.name || 'Unknown Author'

  header.append(avatar)
  header.append(name)

  if (post.date) {
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

    header.append(date)
  }

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
  document.body.append(header)
  document.body.append(article)

  hljs.highlightAll()
}

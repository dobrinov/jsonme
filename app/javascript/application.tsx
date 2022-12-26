import {Route, Routes, Link, BrowserRouter} from 'react-router-dom'

export function Application({product, username}: {product: string; username: string}) {
  return (
    <BrowserRouter basename={`/${product}/${username}`}>
      <Routes>
        <Route path="/" element={<Resume />} />,
        <Route path="posts" element={<PostIndex />} />,
        <Route path="posts/:postId" element={<Post />} />
      </Routes>
    </BrowserRouter>
  )
}

function Resume() {
  return (
    <div>
      <h1>Resume</h1>
      <Link to="posts">posts</Link>
    </div>
  )
}

function PostIndex() {
  return (
    <div>
      <h1>Posts</h1>
      <Link to="..">resume</Link>
      <Link to="some-post">post</Link>
    </div>
  )
}

function Post() {
  return (
    <div>
      <h1>Post</h1>
      <Link to="../posts">posts</Link>
    </div>
  )
}

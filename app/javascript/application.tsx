import {Route, Link, createBrowserRouter, createRoutesFromElements, RouterProvider} from 'react-router-dom'

export function Application({product, username}: {product: string; username: string}) {
  const router = createBrowserRouter(
    createRoutesFromElements([
      <Route
        path="/"
        element={
          <div>
            <h1>Resume</h1>
            <Link to="posts">posts</Link>
          </div>
        }
      />,
      <Route
        path="posts"
        element={
          <div>
            <h1>Posts</h1>
            <Link to="..">resume</Link>
            <Link to="some-post">post</Link>
          </div>
        }
      />,
      <Route
        path="posts/:postId"
        element={
          <div>
            <h1>Post</h1>
            <Link to="../posts">posts</Link>
          </div>
        }
      />
    ]),
    {
      basename: `/${product}/${username}`
    }
  )

  return <RouterProvider router={router} />
}

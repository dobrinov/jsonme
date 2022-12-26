import {Link, createBrowserRouter, RouterProvider} from 'react-router-dom'

export function Application({product, username}: {product: string; username: string}) {
  const router = createBrowserRouter(
    [
      {
        path: '/',
        element: (
          <div>
            <h1>Resume</h1>
            <Link to="posts">posts</Link>
          </div>
        )
      },
      {
        path: 'posts',
        element: (
          <div>
            <h1>Posts</h1>
            <Link to="..">resume</Link>
            <Link to="some-post">post</Link>
          </div>
        )
      },
      {
        path: 'posts/:handle',
        element: (
          <div>
            <h1>Post</h1>
            <Link to="../posts">posts</Link>
          </div>
        )
      }
    ],
    {
      basename: `/${product}/${username}`
    }
  )

  return <RouterProvider router={router} />
}

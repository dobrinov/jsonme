import {createBrowserRouter, RouterProvider} from 'react-router-dom'

export function Application({product, username}: {product: string; username: string}) {
  const router = createBrowserRouter(
    [
      {
        path: '/',
        element: <div>Resume</div>
      },
      {
        path: 'posts',
        element: <div>Posts</div>
      },
      {
        path: 'posts/:handle',
        element: <div>Post</div>
      }
    ],
    {
      basename: `/${product}/${username}`
    }
  )

  return <RouterProvider router={router} />
}

import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { WorkItemsPage } from '../features/work-items/WorkItemsPage'
import { WorkItemDetailsPage } from '../features/work-items/WorkItemDetailsPage'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: <Navigate to="/work-items" replace />,
        },
        {
          path: '/work-items',
          element: <WorkItemsPage />,
        },
        {
          path: '/work-items/:id',
          element: <WorkItemDetailsPage />,
        },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
)

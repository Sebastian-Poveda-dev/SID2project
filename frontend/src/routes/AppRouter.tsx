import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import EventsPage from '../pages/EventsPage';
import EventDetailPage from '../pages/EventDetailPage';
import ProfilePage from '../pages/ProfilePage';
import MyRegistrationsPage from '../pages/MyRegistrationsPage';
import CreateEventPage from '../pages/CreateEventPage';
import ManageEventsPage from '../pages/ManageEventsPage';
import StatisticsPage from '../pages/StatisticsPage';
import EventRegistrantsPage from '../pages/EventRegistrantsPage';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/events', element: <EventsPage /> },
      { path: '/events/:id', element: <EventDetailPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/profile', element: <ProfilePage /> },
          { path: '/my-registrations', element: <MyRegistrationsPage /> },
          { path: '/create-event', element: <CreateEventPage /> },
          { path: '/manage-events', element: <ManageEventsPage /> },
          { path: '/statistics', element: <StatisticsPage /> },
          { path: '/manage-events/:eventId/registrants', element: <EventRegistrantsPage /> },
        ],
      },
    ],
  },
  { path: '/', element: <Navigate to="/events" replace /> },
  { path: '*', element: <Navigate to="/events" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

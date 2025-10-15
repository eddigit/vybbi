import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const SocialWall = lazy(() => import('@/pages/SocialWall'));
const Messages = lazy(() => import('@/pages/Messages'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const Communities = lazy(() => import('@/pages/Communities'));

export const socialRoutes: RouteObject[] = [
  { path: '/social', element: <SocialWall /> },
  { path: '/messages', element: <Messages /> },
  { path: '/notifications', element: <Notifications /> },
  { path: '/communities', element: <Communities /> }
];

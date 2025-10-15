import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const Radio = lazy(() => import('@/pages/Radio'));
const WebTV = lazy(() => import('@/pages/WebTV'));

export const mediaRoutes: RouteObject[] = [
  { path: '/radio', element: <Radio /> },
  { path: '/webtv', element: <WebTV /> }
];

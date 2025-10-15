import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const Token = lazy(() => import('@/pages/Token'));
const VybbiTokens = lazy(() => import('@/pages/VybbiTokens'));

export const tokenRoutes: RouteObject[] = [
  { path: '/token', element: <Token /> },
  { path: '/vybbi-tokens', element: <VybbiTokens /> }
];

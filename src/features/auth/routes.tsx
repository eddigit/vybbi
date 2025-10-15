import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const Auth = lazy(() => import('@/pages/Auth'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));

export const authRoutes: RouteObject[] = [
  {
    path: '/auth',
    element: <Auth />
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/reset-password',
    element: <ResetPassword />
  }
];

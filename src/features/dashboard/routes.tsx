import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Campaigns = lazy(() => import('@/pages/Campaigns'));
const Commissions = lazy(() => import('@/pages/Commissions'));
const Reports = lazy(() => import('@/pages/Reports'));
const Promotion = lazy(() => import('@/pages/Promotion'));

export const dashboardRoutes: RouteObject[] = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/campaigns', element: <Campaigns /> },
  { path: '/commissions', element: <Commissions /> },
  { path: '/reports', element: <Reports /> },
  { path: '/promotion', element: <Promotion /> }
];

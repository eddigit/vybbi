import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const LaunchPartnerParis = lazy(() => import('@/pages/LaunchPartnerParis'));

export const partnerRoutes: RouteObject[] = [
  { path: '/launch-partner-paris', element: <LaunchPartnerParis /> }
];

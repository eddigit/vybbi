import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const Influenceurs = lazy(() => import('@/pages/Influenceurs'));
const InfluenceurDashboard = lazy(() => import('@/pages/InfluenceurDashboard'));

export const influencerRoutes: RouteObject[] = [
  { path: '/influenceurs', element: <Influenceurs /> },
  { path: '/influenceur-dashboard', element: <InfluenceurDashboard /> }
];
